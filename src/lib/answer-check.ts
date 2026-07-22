// 사용자 입력 답과 정답 비교 (대소문자/공백/오타 무시)
export function checkAnswer(input: string, correctAnswers: string[]): boolean {
  const normalized = input.trim().toLowerCase();
  return correctAnswers.some(
    (answer) => answer.trim().toLowerCase() === normalized
  );
}
