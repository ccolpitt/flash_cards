/**
 * Deck model.
 *
 * A named collection of card IDs.
 */
export interface Deck {
    id: string;           // unique identifier (UUID)
    name: string;         // deck name
    card_ids: string[];   // references to Card.id
    card_count: number;   // always === card_ids.length
    version_id: number;   // increments on each update
}
