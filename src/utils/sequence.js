export async function getNextSequenceValue(db, sequenceName) {
    const sequenceDocument = await db.collection('counters').findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { returnDocument: 'after', upsert: true }
    );

    return sequenceDocument.sequence_value;
}