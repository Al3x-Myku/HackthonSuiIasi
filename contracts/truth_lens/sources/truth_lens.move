module truth_lens::truth_lens {
    use std::string::{Self, String};
    use sui::event;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::package;
    use sui::display;

    /// One-Time Witness for the module
    struct TRUTH_LENS has drop {}

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

    fun init(otw: TRUTH_LENS, ctx: &mut TxContext) {
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"link"),
            string::utf8(b"image_url"),
            string::utf8(b"description"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];

        let values = vector[
            string::utf8(b"TruthLens Proof"),
            string::utf8(b"https://truthlens.app"),
            string::utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blob_id}"),
            string::utf8(b"{description}"),
            string::utf8(b"https://truthlens.app"),
            string::utf8(b"TruthLens"),
        ];

        let publisher = package::claim(otw, ctx);
        let display = display::new_with_fields<MediaProof>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
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

    public fun burn(proof: MediaProof) {
        let MediaProof {
            id,
            image_hash: _,
            blob_id: _,
            timestamp: _,
            location: _,
            device_type: _,
            description: _,
        } = proof;
        object::delete(id);
    }
}
