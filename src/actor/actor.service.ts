import {Injectable, NotFoundException} from '@nestjs/common'
import {ModelType, DocumentType} from '@typegoose/typegoose/lib/types'
import {Types} from 'mongoose'
import {InjectModel} from 'nestjs-typegoose'
import {ActorModel} from './actor.model'
import {CreateActorDto} from './dto/create-actor.dto'

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel)
		private readonly actorModel: ModelType<ActorModel>
	) { }

	async getAll(searchTerm?: string): Promise<DocumentType<ActorModel>[]> {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		// Aggregation

		return this.actorModel.find(options)
			.select('-updateAt -__v')
			.sort({
				createdAt: 'desc'
			}).exec()
	}

	async bySlug(slug: string): Promise<DocumentType<ActorModel>> {
		const doc = await this.actorModel.findOne({slug}).exec()

		if (!doc) throw new NotFoundException('Actor not found')
		return doc
	}

	/* Admin area */

	async byId(id: string): Promise<DocumentType<ActorModel>> {
		return this.actorModel.findById(id).exec()
	}

	async create(): Promise<Types.ObjectId> {
		const defaultValue: CreateActorDto = {
			name: '',
			photo: '',
			slug: '',
		}
		const actor = await this.actorModel.create(defaultValue)
		return actor._id
	}

	async update(
		id: string,
		dto: CreateActorDto
	): Promise<DocumentType<ActorModel> | null> {
		return this.actorModel.findByIdAndUpdate(id, dto, {new: true}).exec()
	}

	async delete(id: string): Promise<DocumentType<ActorModel> | null> {
		return this.actorModel.findByIdAndDelete(id).exec()
	}
}
