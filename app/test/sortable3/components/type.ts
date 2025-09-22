import type { MutableRefObject } from 'react';

export type StackStatus = "todo" | "in-progress" | "done" | "deferred";

export interface Stopwatch {
  isRunning: boolean;
  elapsed: number; // milliseconds
}

export interface Timer {
  isRunning: boolean;
  isOverdued: boolean;
  elapsed: number; // milliseconds
  deadline: number; // milliseconds
}

export interface Alarm {
  deadline?: Date;   // 절대 마감 시간
  duration?: number; // 상대 타이머 (ms)
}

export interface StackItem {
  id: string;               // UUID/nanoid 등
  title: string;            // 제제목
  description?: string;     // 상세 설명
  status: StackStatus;      // 상태
  
  stopwatch?: Stopwatch;    // 실제 집중 시간 기록
  timer?: Timer;            // 타이머 설정
  alarm?: Alarm;            // 마감 압박
  
  collapsed?: boolean;      // 접힘 여부
  children: StackItem[];   // 중첩 stack (최대 depth = 5r)
}

export type StackItems = StackItem[];

export interface FlattenedItem extends StackItem {
  parentId: null | string;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;

export interface TreeValue {
  title: string;
  description?: string | null; // nullable 허용
}