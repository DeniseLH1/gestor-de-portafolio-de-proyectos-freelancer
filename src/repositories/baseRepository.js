import { ObjectId } from 'mongodb';

export class BaseRepository {
    constructor(db, collectionName) {
        if (!db || !collectionName) {
        throw new Error('db y collectionName son obligatorios.');
        }
        this.collection = db.collection(collectionName);
    }

     // Convierte un string a ObjectId si es necesario
    _toObjectId(id) {
        return typeof id === 'string' ? new ObjectId(id) : id;
    }

    // 1. Crear un documento
    async create(data, options = {}) {
        const doc = data.toObject ? data.toObject() : { ...data };
        doc.createdAt = new Date();
        doc.updatedAt = new Date();

        const result = await this.collection.insertOne(doc, options);
        return { _id: result.insertedId, ...doc };
    }

    // 2. Obtener todos los documentos
    async findAll(query = {}, options = {}) {
        return await this.collection.find(query, options).toArray();
    }

    // 3. Buscar por ID
    async findById(id, options = {}) {
        return await this.collection.findOne({ _id: this._toObjectId(id) }, options);
    }

    // 4. Actualizar por ID
    async update(id, data, options = {}) {
        const updateData = data.toObject ? data.toObject() : { ...data };
        updateData.updatedAt = new Date();

        const result = await this.collection.findOneAndUpdate(
        { _id: this._toObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after', ...options }
        );
        return result;
    }

    // 5. Eliminar por ID
    async delete(id, options = {}) {
        const result = await this.collection.deleteOne({ _id: this._toObjectId(id) }, options);
        return result.deletedCount > 0;
    }
}

export default BaseRepository;