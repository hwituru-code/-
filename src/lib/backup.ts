import { unzipSync, zipSync } from "fflate";
import { PainEntry } from "./analysis/types";
import { UserProfile } from "./profile/types";

const EXPORT_VERSION = 1;

interface ExportFile {
  version: number;
  exportedAt: string;
  entries: PainEntry[];
  profile?: UserProfile;
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[\\/:*?"<>|\s]+/g, "_");
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function hasProfileContent(profile?: UserProfile | null): profile is UserProfile {
  if (!profile) return false;
  return profile.heightCm !== null || profile.weightKg !== null || profile.notes.trim().length > 0;
}

function buildExportFile(entries: PainEntry[], profile?: UserProfile | null): ExportFile {
  const file: ExportFile = { version: EXPORT_VERSION, exportedAt: new Date().toISOString(), entries };
  if (hasProfileContent(profile)) file.profile = profile;
  return file;
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // 파일명은 일부 브라우저/OS 조합에서 비-ASCII 문자를 다루지 못하는 경우가 있어 ASCII로 고정한다.
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function groupByBodyPart(entries: PainEntry[]): Map<string, PainEntry[]> {
  const byPart = new Map<string, PainEntry[]>();
  for (const entry of entries) {
    const parts = entry.analysis.bodyParts.length > 0 ? entry.analysis.bodyParts : ["미분류"];
    for (const part of parts) {
      const list = byPart.get(part) ?? [];
      list.push(entry);
      byPart.set(part, list);
    }
  }
  return byPart;
}

function sortChronological(entries: PainEntry[]): PainEntry[] {
  return [...entries].sort(
    (a, b) => a.loggedAt.localeCompare(b.loggedAt) || a.createdAt.localeCompare(b.createdAt)
  );
}

function formatEntryAsText(entry: PainEntry): string {
  const { bodyParts, symptoms, lifestyleTags, severity } = entry.analysis;
  const lines = [`[${entry.loggedAt}]${severity !== null ? ` 통증 ${severity}/10` : ""}`];

  const tagParts: string[] = [];
  if (bodyParts.length > 0) tagParts.push(`부위: ${bodyParts.join(", ")}`);
  if (symptoms.length > 0) tagParts.push(`증상: ${symptoms.join(", ")}`);
  if (lifestyleTags.length > 0) tagParts.push(`생활습관: ${lifestyleTags.map((t) => t.tag).join(", ")}`);
  if (tagParts.length > 0) lines.push(tagParts.join(" · "));

  lines.push(entry.content);
  return lines.join("\n");
}

function formatProfileAsText(profile?: UserProfile | null): string {
  if (!hasProfileContent(profile)) return "";
  const lines = ["[내 정보]"];
  if (profile.heightCm !== null) lines.push(`키: ${profile.heightCm}cm`);
  if (profile.weightKg !== null) lines.push(`몸무게: ${profile.weightKg}kg`);
  if (profile.notes.trim()) lines.push(`특이사항: ${profile.notes.trim()}`);
  return lines.join("\n");
}

function formatEntriesAsText(title: string, entries: PainEntry[], profile?: UserProfile | null): string {
  const header = [title, `내보낸 날짜: ${new Date().toLocaleString("ko-KR")}`, `총 ${entries.length}개 기록`].join(
    "\n"
  );
  const profileSection = formatProfileAsText(profile);
  const body = sortChronological(entries)
    .map(formatEntryAsText)
    .join("\n\n" + "-".repeat(20) + "\n\n");
  const sections = profileSection ? [header, profileSection, body] : [header, body];
  return sections.join("\n\n" + "-".repeat(20) + "\n\n") + "\n";
}

/** 전체 기록을 사람이 읽기 좋은 하나의 텍스트(.txt) 파일로 내려받는다. 프로필 정보가 있으면 맨 앞에 포함한다. */
// Windows 메모장 등 일부 텍스트 뷰어는 BOM 없는 UTF-8을 시스템 로캘(CP949 등)로 잘못 해석해
// 한글이 깨져 보인다. BOM을 붙여 UTF-8임을 명시한다.
const UTF8_BOM = "﻿";

export function exportAllEntriesAsText(entries: PainEntry[], profile?: UserProfile | null): void {
  const text = formatEntriesAsText("심프텀 노트 - 전체 기록", entries, profile);
  triggerDownload(
    `pain-log-all-${todayStamp()}.txt`,
    new Blob([UTF8_BOM + text], { type: "text/plain;charset=utf-8" })
  );
}

/** 신체 부위별로 나눠서 여러 개의 텍스트(.txt) 파일을 하나의 zip으로 내려받는다. */
export function exportEntriesByBodyPartAsText(entries: PainEntry[]): void {
  const byPart = groupByBodyPart(entries);
  const files: Record<string, Uint8Array> = {};
  const encoder = new TextEncoder();
  for (const [part, list] of byPart) {
    const text = formatEntriesAsText(`심프텀 노트 - ${part} 기록`, list);
    files[`${sanitizeFilenamePart(part)}.txt`] = encoder.encode(UTF8_BOM + text);
  }
  const zipped = zipSync(files);
  triggerDownload(`pain-log-by-bodypart-text-${todayStamp()}.zip`, new Blob([zipped], { type: "application/zip" }));
}

/** 전체 기록을 하나의 JSON 파일로 내려받는다. 프로필(키/몸무게/특이사항)이 있으면 함께 포함한다. */
export function exportAllEntries(entries: PainEntry[], profile?: UserProfile | null): void {
  const json = JSON.stringify(buildExportFile(entries, profile), null, 2);
  triggerDownload(`pain-log-all-${todayStamp()}.json`, new Blob([json], { type: "application/json" }));
}

/**
 * 신체 부위별로 나눠서 여러 개의 JSON 파일을 하나의 zip으로 내려받는다
 * (브라우저가 여러 파일을 동시에 다운로드받는 걸 막는 경우가 많아 zip으로 묶는다).
 * 한 기록이 여러 부위를 언급하면 각 부위 파일에 중복 포함된다.
 */
export function exportEntriesByBodyPart(entries: PainEntry[]): void {
  const byPart = groupByBodyPart(entries);
  const files: Record<string, Uint8Array> = {};
  const encoder = new TextEncoder();
  for (const [part, list] of byPart) {
    const json = JSON.stringify(buildExportFile(list), null, 2);
    files[`${sanitizeFilenamePart(part)}.json`] = encoder.encode(json);
  }
  const zipped = zipSync(files);
  triggerDownload(`pain-log-by-bodypart-${todayStamp()}.zip`, new Blob([zipped], { type: "application/zip" }));
}

export interface ParsedImport {
  entries: PainEntry[];
  /** 업로드한 파일들 중 가장 최근에 저장된 프로필 (있는 경우) */
  profile: UserProfile | null;
  fileErrors: { fileName: string; message: string }[];
}

function isPainEntry(value: unknown): value is PainEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.content === "string" &&
    typeof v.loggedAt === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.analysis === "object" &&
    v.analysis !== null
  );
}

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.heightCm === null || typeof v.heightCm === "number") &&
    (v.weightKg === null || typeof v.weightKg === "number") &&
    typeof v.notes === "string"
  );
}

function extractEntriesFromJSON(json: unknown): PainEntry[] {
  const list: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as { entries?: unknown[] })?.entries)
      ? (json as { entries: unknown[] }).entries
      : [];
  return list.filter(isPainEntry);
}

function extractProfileFromJSON(json: unknown): UserProfile | null {
  const profile = (json as { profile?: unknown })?.profile;
  return isUserProfile(profile) ? profile : null;
}

function isNewerProfile(candidate: UserProfile, current: UserProfile | null): boolean {
  if (!current) return true;
  if (!candidate.updatedAt) return false;
  if (!current.updatedAt) return true;
  return candidate.updatedAt > current.updatedAt;
}

async function parseJSONFile(file: File): Promise<{ entries: PainEntry[]; profile: UserProfile | null }> {
  const text = await file.text();
  const json = JSON.parse(text);
  return { entries: extractEntriesFromJSON(json), profile: extractProfileFromJSON(json) };
}

async function parseZipFile(file: File): Promise<{ entries: PainEntry[]; innerErrors: string[] }> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const unzipped = unzipSync(buffer);
  const entries: PainEntry[] = [];
  const innerErrors: string[] = [];
  const decoder = new TextDecoder();

  for (const [innerName, data] of Object.entries(unzipped)) {
    if (!innerName.endsWith(".json")) continue;
    try {
      const json = JSON.parse(decoder.decode(data));
      entries.push(...extractEntriesFromJSON(json));
    } catch {
      innerErrors.push(innerName);
    }
  }
  return { entries, innerErrors };
}

/** 하나 이상의 내보내기 파일(JSON 또는 zip)을 읽어 유효한 기록(및 있다면 프로필)만 모은다. 여러 파일을 한 번에 업로드할 수 있다. */
export async function parseImportFiles(files: FileList | File[]): Promise<ParsedImport> {
  const entries: PainEntry[] = [];
  const fileErrors: { fileName: string; message: string }[] = [];
  let profile: UserProfile | null = null;

  for (const file of Array.from(files)) {
    try {
      const isZip = file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip";
      if (isZip) {
        const { entries: zipEntries, innerErrors } = await parseZipFile(file);
        if (zipEntries.length === 0) {
          fileErrors.push({ fileName: file.name, message: "zip 안에서 인식 가능한 기록을 찾지 못했어요." });
        } else {
          entries.push(...zipEntries);
        }
        for (const inner of innerErrors) {
          fileErrors.push({ fileName: `${file.name} → ${inner}`, message: "JSON을 읽을 수 없어요." });
        }
        continue;
      }

      const parsed = await parseJSONFile(file);
      if (parsed.entries.length === 0 && !parsed.profile) {
        fileErrors.push({ fileName: file.name, message: "심프텀 노트에서 내보낸 파일 형식이 아니에요." });
        continue;
      }
      entries.push(...parsed.entries);
      if (parsed.profile && isNewerProfile(parsed.profile, profile)) {
        profile = parsed.profile;
      }
    } catch {
      fileErrors.push({ fileName: file.name, message: "파일을 읽을 수 없어요." });
    }
  }

  return { entries, profile, fileErrors };
}
