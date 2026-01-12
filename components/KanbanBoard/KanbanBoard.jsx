'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
    { id: 'A_FAIRE', title: 'À faire', className: styles.columnAFaire },
    { id: 'EN_COURS', title: 'En cours', className: styles.columnEnCours },
    { id: 'DEPOSE', title: 'Déposé', className: styles.columnDepose },
    { id: 'A_VALIDER', title: 'À valider', className: styles.columnAValider },
    { id: 'VALIDE', title: 'Validé', className: styles.columnValide },
    { id: 'REJETE', title: 'Rejeté', className: styles.columnRejete },
];

export default function KanbanBoard({ deliverables, onStatusChange }) {
    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;

        // Call the status change handler
        const newStatus = destination.droppableId;
        const deliverableId = draggableId;

        onStatusChange(deliverableId, newStatus);
    };

    const getDeliverablesForColumn = (status) => {
        return deliverables.filter(d => d.status === status);
    };

    const isLate = (deliverable) => {
        if (deliverable.status === 'VALIDE') return false;
        const now = new Date();
        const dueDate = new Date(deliverable.dueDate);
        return now > dueDate;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getLotColor = (lot) => {
        const colors = {
            'Structure': 'purple',
            'CVC': 'blue',
            'Électricité': 'orange',
            'Plomberie': 'green',
            'Général': 'gray',
        };
        return colors[lot] || 'gray';
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className={styles.kanban}>
                {COLUMNS.map((column) => {
                    const columnDeliverables = getDeliverablesForColumn(column.id);

                    return (
                        <div key={column.id} className={`${styles.column} ${column.className}`}>
                            <div className={styles.columnHeader}>
                                <span className={styles.columnTitle}>
                                    {column.title}
                                    <span className={styles.columnCount}>{columnDeliverables.length}</span>
                                </span>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={styles.cardsContainer}
                                    >
                                        {columnDeliverables.map((deliverable, index) => (
                                            <Draggable
                                                key={deliverable.id}
                                                draggableId={deliverable.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`${styles.card} ${isLate(deliverable) ? styles.cardLate : ''
                                                            } ${snapshot.isDragging ? styles.cardDragging : ''}`}
                                                    >
                                                        <div className={styles.cardHeader}>
                                                            <h4 className={styles.cardTitle}>{deliverable.name}</h4>
                                                        </div>

                                                        <div className={styles.cardLot}>
                                                            <span className={`badge badge-${getLotColor(deliverable.lot)}`}>
                                                                {deliverable.lot}
                                                            </span>
                                                        </div>

                                                        <div className={styles.cardMeta}>
                                                            <div className={styles.cardMetaRow}>
                                                                <span>📅</span>
                                                                <span>{formatDate(deliverable.dueDate)}</span>
                                                                {isLate(deliverable) && (
                                                                    <span className={styles.lateLabel}>⚠️ Retard</span>
                                                                )}
                                                            </div>
                                                            <div className={styles.cardMetaRow}>
                                                                <span>👤</span>
                                                                <span>{deliverable.responsable}</span>
                                                            </div>
                                                            <div className={styles.cardMetaRow}>
                                                                <span>📁</span>
                                                                <span>{deliverable.phase}</span>
                                                            </div>
                                                        </div>

                                                        <div className={styles.cardFooter}>
                                                            <span className={styles.cardVersion}>v{deliverable.version}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {columnDeliverables.length === 0 && (
                                            <div style={{
                                                padding: 'var(--spacing-lg)',
                                                textAlign: 'center',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: 'var(--font-size-sm)',
                                            }}>
                                                Aucun livrable
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
