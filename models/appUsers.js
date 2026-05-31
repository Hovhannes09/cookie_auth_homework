import _ from 'lodash'
import sequelize from '../clients/db.mysql.js'
import { DataTypes } from 'sequelize'

const AppUser = sequelize.define(
	'AppUser',
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(50), allowNull: false },
		email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
		password: { type: DataTypes.STRING(255), allowNull: false },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{
		tableName: 'app_users',
		timestamps: false
	}
)

export async function findByEmail(email) {
	try {
		const user = await AppUser.findOne({ where: { email } })
		return _.defaultTo(user, null)
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function createUser({ name, email, password }) {
	try {
		const user = await AppUser.create({ name, email, password })
		return user.id
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function findById(id) {
	try {
		const user = await AppUser.findOne({
			where: { id },
			attributes: ['id', 'name', 'email', 'created_at']
		})
		return _.defaultTo(user, null)
	} catch (error) {
		console.error(error)
		return null
	}
}

export default { findByEmail, createUser, findById }
