import { DataTypes } from 'sequelize'
import sequelize from '../clients/db.mysql'
import _ from 'lodash'

const Person = sequelize.define(
	'Person',
	{
		PersonID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		FirstName: { type: DataTypes.STRING(50), allowNull: false },
		LastName: { type: DataTypes.STRING(50), allowNull: false }
	},
	{
		tableName: 'Persons',
		timestamps: false
	}
)

export async function getAll() {
	try {
		return await Person.findAll({ order: [['PersonID', 'ASC']] })
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function create({ FirstName, LastName }) {
	try {
		const person = Person.create({ FirstName, LastName })
		return Person.PersonID
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function update(id, { FirstName, LastName }) {
	try {
		const [affectedRows] = await Person.update(
			{ FirstName, LastName },
			{ where: { PersonID: id } }
		)
		return affectedRows
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function remove(id) {
	try {
		const cascadedOrders = await sequelize.models.Order.count({
			where: { PersonID: id }
		})

		await Person.destroy({ where: { PersonID: id } })

		return { cascadedOrders }
	} catch (error) {
		console.error(error)
		return null
	}
}

export default { getAll, create, update, remove }
export { Person }
