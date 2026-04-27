import { useAppDispatch } from '@/hooks/redux'
import { uiActions } from '@/store/uiSlice'
import { useRowRecapData, type ResolvedLink, type RowEntry } from './useRowRecapData'
import styles from './RowRecap.module.css'

function chipLabel(link: ResolvedLink, direction: 'in' | 'out'): string {
  const arrow = direction === 'in' ? '←' : '→'
  const room = link.sameRoom ? '' : ` (${link.otherRoomName})`
  return `${arrow} Rangée ${link.otherRowIndex}${room}`
}

interface ChipHandlers {
  onEnter: (linkId: string) => () => void
  onLeave: () => void
}

interface RowLineProps {
  row: RowEntry
  handlers: ChipHandlers
}

function RowLine({ row, handlers }: RowLineProps) {
  return (
    <li className={styles.rowItem}>
      <div className={styles.rowHeader}>Rangée {row.rowIndex}</div>
      <div className={styles.endpoints}>
        {row.firstLength !== null && (
          <div className={styles.endpoint}>
            <span className={styles.endpointLabel}>Première</span>
            <span className={styles.endpointValue}>{row.firstLength} cm</span>
            {row.incoming && (
              <button
                type="button"
                className={styles.chip}
                onPointerEnter={handlers.onEnter(row.incoming.linkId)}
                onPointerLeave={handlers.onLeave}
                onFocus={handlers.onEnter(row.incoming.linkId)}
                onBlur={handlers.onLeave}
              >
                {chipLabel(row.incoming, 'in')}
              </button>
            )}
          </div>
        )}
        {row.lastLength !== null && (
          <div className={styles.endpoint}>
            <span className={styles.endpointLabel}>Dernière</span>
            <span className={styles.endpointValue}>{row.lastLength} cm</span>
            {row.outgoing && (
              <button
                type="button"
                className={styles.chip}
                onPointerEnter={handlers.onEnter(row.outgoing.linkId)}
                onPointerLeave={handlers.onLeave}
                onFocus={handlers.onEnter(row.outgoing.linkId)}
                onBlur={handlers.onLeave}
              >
                {chipLabel(row.outgoing, 'out')}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export function RowRecap() {
  const dispatch = useAppDispatch()
  const recap = useRowRecapData()

  const totalRows = recap.reduce((sum, r) => sum + r.rows.length, 0)
  if (totalRows === 0) {
    return <p className={styles.empty}>Pas encore de rangée à récapituler.</p>
  }

  const handlers: ChipHandlers = {
    onEnter: (linkId: string) => () => dispatch(uiActions.setHoveredOffcutLinkId(linkId)),
    onLeave: () => dispatch(uiActions.setHoveredOffcutLinkId(null)),
  }

  return (
    <div className={styles.recap}>
      {recap.map(room => (
        <section key={room.roomId} className={styles.room}>
          <h4 className={styles.roomName}>{room.roomName}</h4>
          <ul className={styles.rowList}>
            {room.rows.map(row => (
              <RowLine key={row.rowId} row={row} handlers={handlers} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
