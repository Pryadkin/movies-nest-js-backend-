import {Injectable, NotFoundException} from '@nestjs/common'
import {ModelType, DocumentType} from '@typegoose/typegoose/lib/types'
import {Types} from 'mongoose'
import {InjectModel} from 'nestjs-typegoose'

import {CreateMovieDto} from './dto/create-movie.dto'
import {MovieModel} from './movie.model'
import {TelegramService} from 'src/telegram/telegram.service'

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>,
		private readonly telegramService: TelegramService
	) { }

	async getAll(searchTerm?: string): Promise<DocumentType<MovieModel>[]> {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.movieModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({createdAt: 'desc'})
			.populate('genres actors')
			.exec()
	}

	async bySlug(slug: string): Promise<DocumentType<MovieModel>> {
		const doc = await this.movieModel.findOne({slug}).populate('genres actors').exec()

		if (!doc) throw new NotFoundException('Movies not found')
		return doc
	}

	async byActor(actorId: Types.ObjectId): Promise<DocumentType<MovieModel>[]> {
		const doc = await this.movieModel.find({actors: actorId}).exec()

		if (!doc) throw new NotFoundException('Movies not found')
		return doc
	}

	async byGenres(
		genreIds: Types.ObjectId[]
	): Promise<DocumentType<MovieModel>[]> {
		const isTypeCheck = Types.ObjectId.isValid(String(genreIds))

		if (isTypeCheck) {
			const doc = await this.movieModel.find({genres: {$in: genreIds}}).exec()

			if (doc.length === 0) throw new NotFoundException('Movies not found')
			return doc
		} else {
			throw new NotFoundException('invalid number of identifier characters')
		}
	}

	async updateCountOpened(slug: string) {
		return this.movieModel
			.findOneAndUpdate(
				{slug},
				{
					$inc: {countOpened: 1}
				},
				{
					new: true
				}
			)
			.exec()
	}

	/* Admin area */

	async byId(id: string): Promise<DocumentType<MovieModel>> {
		return this.movieModel.findById(id).exec()
	}

	async create(): Promise<Types.ObjectId> {
		const defaultValue: CreateMovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			description: '',
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		}
		const movie = await this.movieModel.create(defaultValue)
		return movie._id
	}

	async update(
		id: string,
		dto: CreateMovieDto
	): Promise<DocumentType<MovieModel> | null> {
		if (!dto.isSendTelegram) {
			await this.sendNotifications(dto)
			dto.isSendTelegram = true
		}

		return this.movieModel.findByIdAndUpdate(id, dto, {new: true}).exec()
	}

	async delete(id: string): Promise<DocumentType<MovieModel> | null> {
		return this.movieModel.findByIdAndDelete(id).exec()
	}

	async getMostPopular(): Promise<DocumentType<MovieModel>[]> {
		return this.movieModel
			.find({countOpened: {$gt: 0}})
			.sort({countOpened: -1})
			.populate('genres')
			.exec()
	}

	async updateRating(id: string, newRating: number) {
		return this.movieModel
			.findByIdAndUpdate(id, {rating: newRating}, {new: true})
			.exec()
	}

	/* Utilites */
	async sendNotifications(dto: CreateMovieDto) {
		// if (process.env.NODE_ENV !== 'development')
		// console.log(this.telegramService)
		await this.telegramService.sendPhoto('https://w.forfun.com/fetch/9d/9db2d4683d92f5f2045e9142fbd82633.jpeg')

		const msg = `<b>${dto.title}</b>\n\n` + `${dto.description}\n\n`

		await this.telegramService.sendMessage(msg, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							url: 'https://okko.tv/movie/free-guy',
							text: '🍿 Go to watch',
						},
					],
				],
			},
		})
	}
}
