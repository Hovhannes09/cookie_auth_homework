import { DataTypes } from 'sequelize'
import sequelize from '../clients/db.mysql.js'
import { Person } from './persons.js'

const Order = sequelize.define(
	'Order',
	{
		OrderID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		OrderNumber: { type: DataTypes.INTEGER, allowNull: false },
		PersonID: { type: DataTypes.INTEGER, allowNull: true }
	},
	{
		tableName: 'Orders',
		timestamps: false
	}
)

Order.belongsTo(Person, { foreignKey: 'PersonID' })
Person.hasMany(Order, {
	foreignKey: 'PersonID',
	onDelete: 'CASCADE',
	onUpdate: 'CASCADE'
})

export async function getAll() {
	try {
		return await Order.findAll({
			include: [
				{
					model: Person,
					attributes: ['FirstName', 'LastName']
				}
			],
			order: [['OrderID', 'ASC']]
		})
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function create({ OrderNumber, PersonID }) {
	try {
		const order = await Order.create({ OrderNumber, PersonID })
		return { insertId: order.OrderID }
	} catch (error) {
		console.error(error)
		throw error
	}
}

export async function remove(id) {
	try {
		const count = await Order.destroy({ where: { OrderID: id } })
		return count
	} catch (error) {
		console.error(error)
		return null
	}
}

export default { getAll, create, remove }
export { Order }
