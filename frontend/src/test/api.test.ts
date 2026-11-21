import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: () => ({ get, post }),
  },
}));

import { calculateRoi, fetchSharedResult } from '@/lib/api';
import type { RoiCalculationResponse } from '@/types/api';

const result = {
  uuid: 'abc-123',
  shareableUrl: 'https://eduroi.com/share/abc-123',
  roiResults: { netRoi: 1000, verdict: 'Good' },
  inputSummary: { country: 'United States', currencySymbol: '$' },
} as unknown as RoiCalculationResponse;

describe('API client', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('unwraps a successful calculation response', async () => {
    post.mockResolvedValue({ data: { success: true, data: result, timestamp: 1 } });

    const payload = { countryCode: 'USA', tuitionAnnual: 1000 } as never;
    await expect(calculateRoi(payload)).resolves.toEqual(result);
    expect(post).toHaveBeenCalledWith('/api/v1/roi/calculate', payload);
  });

  it('throws the API error message for failed requests', async () => {
    post.mockResolvedValue({
      data: { success: false, message: 'Invalid input', timestamp: 1 },
    });

    await expect(calculateRoi({} as never)).rejects.toThrow('Invalid input');
  });

  it('reads a shared result returned as a bare response', async () => {
    get.mockResolvedValue({ data: { success: true, data: result, timestamp: 1 } });

    await expect(fetchSharedResult('abc-123')).resolves.toEqual(result);
    expect(get).toHaveBeenCalledWith('/api/v1/roi/share/abc-123');
  });

  it('reads a shared result returned in a second wrapper', async () => {
    get.mockResolvedValue({
      data: {
        success: true,
        data: { success: true, data: result, timestamp: 1 },
        timestamp: 1,
      },
    });

    await expect(fetchSharedResult('abc-123')).resolves.toEqual(result);
  });

  it('rejects unknown shared result shapes', async () => {
    get.mockResolvedValue({ data: { success: true, data: { unexpected: true }, timestamp: 1 } });

    await expect(fetchSharedResult('abc-123')).rejects.toThrow('Invalid shared result structure');
  });
});
