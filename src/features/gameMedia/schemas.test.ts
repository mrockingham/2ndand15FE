import { curatedVideoFormSchema } from '@/features/gameMedia/schemas';

const validValues = {
  title: 'Bills vs. Dolphins | Full Highlights',
  embedUrl: 'https://www.youtube.com/embed/curated-1',
  canonicalUrl: 'https://www.youtube.com/watch?v=curated-1',
  thumbnailUrl: 'https://static.example.com/thumb.jpg',
  sourceLabel: 'NFL',
};

describe('curatedVideoFormSchema', () => {
  it('accepts fully populated valid input', () => {
    expect(curatedVideoFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts empty optional fields', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      canonicalUrl: '',
      thumbnailUrl: '',
      sourceLabel: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty embed URL', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      embedUrl: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-HTTPS embed URL', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      embedUrl: 'http://www.youtube.com/embed/curated-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects pasted iframe/HTML markup instead of a bare URL', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      embedUrl:
        '<iframe src="https://www.youtube.com/embed/curated-1"></iframe>',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-HTTPS optional canonical URL', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      canonicalUrl: 'http://www.youtube.com/watch?v=curated-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects the oEmbed check URL pasted in place of the actual embed URL', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      embedUrl:
        'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=xWr-cyWMdJ4',
    });
    expect(result.success).toBe(false);
  });

  it('enforces the title length cap', () => {
    const result = curatedVideoFormSchema.safeParse({
      ...validValues,
      title: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
