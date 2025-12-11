module truth_lens::truth_lens {
    use std::string::{String};
    use sui::event;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Struct to represent a verified media proof
    struct MediaProof has key, store {
        id: UID,
        image_hash: String,
        blob_id: String,
        timestamp: u64,
        location: String,
        device_type: String,
        description: String,
    }

    /// Event emitted when a new proof is minted
    struct ProofMinted has copy, drop {
        proof_id: ID,
        minter: address,
        image_hash: String,
    }

    /// Mint a new MediaProof and transfer it to the sender
    public fun mint_proof(
        image_hash: String,
        blob_id: String,
        timestamp: u64,
        location: String,
        device_type: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let proof_id = object::uid_to_inner(&id);
        let minter = tx_context::sender(ctx);

        let proof = MediaProof {
            id,
            image_hash,
            blob_id,
            timestamp,
            location,
            device_type,
            description,
        };

        event::emit(ProofMinted {
            proof_id,
            minter,
            image_hash,
        });

        transfer::public_transfer(proof, minter);
    }
}
