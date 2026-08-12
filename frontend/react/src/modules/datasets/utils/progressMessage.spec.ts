import { describe, it, expect } from 'vitest';
import { toProgressMessageSegments } from './progressMessage';

describe('toProgressMessageSegments', () => {
  it('returns no segments for an empty message', () => {
    expect(toProgressMessageSegments('')).toEqual([]);
  });

  it('returns no segments for a whitespace-only message', () => {
    expect(toProgressMessageSegments('   \n\n  ')).toEqual([]);
  });

  it('returns a single plain segment when there is no error', () => {
    expect(toProgressMessageSegments('Task dispatched')).toEqual([
      { text: 'Task dispatched', isError: false },
    ]);
  });

  it('collapses runs of newlines down to a single newline', () => {
    const segments = toProgressMessageSegments('Start\n\n\n\nEnd');
    expect(segments).toEqual([{ text: 'Start\nEnd', isError: false }]);
  });

  it('marks an error line as an error segment and leaves surrounding text plain', () => {
    const segments = toProgressMessageSegments(
      'Parsing began\n[ERROR] unsupported encoding\nRetrying',
    );

    expect(segments).toEqual([
      { text: 'Parsing began\n', isError: false },
      { text: '[ERROR] unsupported encoding\n', isError: true },
      { text: 'Retrying', isError: false },
    ]);
  });

  it('marks every error line when several are present', () => {
    const segments = toProgressMessageSegments(
      '[ERROR] first failure\n[ERROR] second failure\n',
    );

    expect(segments).toEqual([
      { text: '[ERROR] first failure\n', isError: true },
      { text: '[ERROR] second failure', isError: true },
    ]);
  });

  it('trims leading and trailing whitespace before splitting', () => {
    expect(toProgressMessageSegments('  \n Done \n  ')).toEqual([
      { text: 'Done', isError: false },
    ]);
  });

  it('marks a trailing error line that has no trailing newline', () => {
    expect(toProgressMessageSegments('Parsing\n[ERROR] truncated')).toEqual([
      { text: 'Parsing\n', isError: false },
      { text: '[ERROR] truncated', isError: true },
    ]);
  });

  it('marks the whole error line rather than stopping at an interior space', () => {
    const segments = toProgressMessageSegments('[ERROR] unsupported encoding');
    expect(segments).toEqual([
      { text: '[ERROR] unsupported encoding', isError: true },
    ]);
  });
});
