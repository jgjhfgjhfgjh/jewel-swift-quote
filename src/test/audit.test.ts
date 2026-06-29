import { describe, it, expect } from 'vitest';
import {
  FLAT_NODES,
  COCKPIT_TREE,
  mergeRows,
  defaultRow,
  manifest,
  type AuditRow,
} from '@/lib/audit/cockpit';

describe('cockpit site tree', () => {
  it('builds a non-empty tree', () => {
    expect(COCKPIT_TREE.length).toBeGreaterThan(0);
    expect(FLAT_NODES.length).toBeGreaterThan(100);
  });

  // Klíčový invariant: kolize node_id by tiše slila stav verifikace dvou prvků.
  it('has unique node ids', () => {
    const ids = FLAT_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every node carries page + cluster context', () => {
    for (const n of FLAT_NODES) {
      expect(n.pageLabel).toBeTruthy();
      expect(n.clusterLabel).toBeTruthy();
      expect(n.copySource).toBeTruthy();
    }
  });

  it('archive pages default to not-live', () => {
    const archive = FLAT_NODES.filter((n) => n.clusterId === 'archive');
    expect(archive.length).toBeGreaterThan(0);
    expect(archive.every((n) => n.isLiveDefault === false)).toBe(true);
  });
});

describe('mergeRows', () => {
  it('returns a full row for every node, defaulting to todo', () => {
    const merged = mergeRows([]);
    expect(Object.keys(merged).length).toBe(FLAT_NODES.length);
    for (const n of FLAT_NODES) {
      expect(merged[n.id].copy_status).toBe('todo');
      expect(merged[n.id].structure_status).toBe('todo');
      expect(merged[n.id].is_live).toBe(n.isLiveDefault);
    }
  });

  it('applies DB overrides over defaults', () => {
    const target = FLAT_NODES[0];
    const row: AuditRow = {
      ...defaultRow(target),
      copy_status: 'approved',
      structure_status: 'needs_fix',
    };
    const merged = mergeRows([row]);
    expect(merged[target.id].copy_status).toBe('approved');
    expect(merged[target.id].structure_status).toBe('needs_fix');
  });
});

describe('copy manifest coverage', () => {
  it('EN is the base (near full), other langs lag — confirms extractor signal', () => {
    const total = manifest.totalStrings;
    expect(total).toBeGreaterThan(1000);
    const en = manifest.langCoverage.en.present / total;
    const cs = manifest.langCoverage.cs.present / total;
    const pl = manifest.langCoverage.pl.present / total;
    expect(en).toBeGreaterThan(0.95);
    expect(cs).toBeGreaterThan(0.7);
    expect(pl).toBeLessThan(0.5); // jen částečně přeloženo
  });
});
