const REPEATED_NEWLINES_REGEX = /(\n)\1+/g;

const ERROR_SEGMENT_REGEX = /(\[ERROR\][^\n]*\n?)/g;

// String.split() with a capturing group interleaves the captures into the
// result, so odd indexes are always the matched [ERROR] segments.
const isCapturedErrorSegment = (splitIndex: number) => splitIndex % 2 === 1;

export interface ProgressMessageSegment {
  text: string;
  isError: boolean;
}

export const toProgressMessageSegments = (
  message: string,
): ProgressMessageSegment[] =>
  message
    .trim()
    .replace(REPEATED_NEWLINES_REGEX, '$1')
    .split(ERROR_SEGMENT_REGEX)
    .map((text, splitIndex) => ({
      text,
      isError: isCapturedErrorSegment(splitIndex),
    }))
    .filter((segment) => segment.text !== '');
