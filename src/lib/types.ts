export type PuzzleSet = {
  id: string;
  play_date: string;
};

export type PuzzleItem = {
  id: string;
  puzzle_set_id: string;
  order_index: number;
  image_path: string;
  answer: string;
  accepted_answers: string[];
};

// 클라이언트로 내려보내는 문제 (정답 필드 제외)
export type PublicPuzzleItem = {
  id: string;
  order_index: number;
  image_url: string;
};

export type PublicPuzzleSet = {
  puzzleSetId: string;
  playDate: string;
  items: PublicPuzzleItem[];
};

export type ScoreEntry = {
  nickname: string;
  total_time_ms: number;
  created_at: string;
};
