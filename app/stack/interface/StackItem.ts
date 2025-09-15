type StackStatus = "todo" | "in-progress" | "done" | "deferred";

interface Stopwatch {
  isRunning: boolean;
  elapsed: number; // milliseconds
}

interface Timer {
    isRunning: boolean;
    isOverdued: boolean;
    elapsed: number; // milliseconds
    deadline: number; // milliseconds
}

interface Alarm {
  deadline?: Date;   // 절대 마감 시간
  duration?: number; // 상대 타이머 (ms)
}

export default interface StackItem {
  id: string;               // UUID/nanoid 등
  title: string;            // 짧은 제목
  description?: string;     // 상세 설명 (optional)
  status: StackStatus;      // 상태
  
  stopwatch?: Stopwatch;    // 실제 집중 시간 기록
  timer?: Timer;            // 타이머 설정
  alarm?: Alarm;            // 마감 압박
  
  children?: StackItem[];   // 중첩 stack (최대 depth = 4)
}