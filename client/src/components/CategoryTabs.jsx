import { useEffect, useRef } from 'react';

export default function CategoryTabs({ categories, activeId, onSelect }) {
  const scrollRef = useRef(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  return (
    <div style={styles.wrapper}>
      <div ref={scrollRef} style={styles.scroll}>
        <button
          data-active={activeId === null}
          onClick={() => onSelect(null)}
          style={{
            ...styles.tab,
            ...(activeId === null ? styles.tabActive : {}),
          }}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-active={activeId === cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              ...styles.tab,
              ...(activeId === cat.id ? styles.tabActive : {}),
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: '#fff',
    borderBottom: '1px solid #F0F0F0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  scroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: 6,
    padding: '10px 12px',
    whiteSpace: 'nowrap',
  },
  tab: {
    flexShrink: 0,
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    color: '#6B7280',
    background: '#F5F6FA',
    transition: 'all 0.2s',
    border: '1.5px solid transparent',
  },
  tabActive: {
    color: '#5B67F8',
    background: '#EEF0FF',
    border: '1.5px solid #5B67F8',
  },
};
