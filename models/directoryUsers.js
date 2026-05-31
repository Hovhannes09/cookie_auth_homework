import { DataTypes } from 'sequelize'
import sequelize from '../clients/db.mysql.js'

const DirectoryUser = sequelize.define(
	'DirectoryUser',
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(50), allowNull: false }
	},
	{
		tableName: 'directory_users',
		timestamps: false
	}
)

export async function create({ name }) {
	try {
		const user = await DirectoryUser.create({ name })
		return user.id
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function getUnique() {
	try {
		const [rows] = await sequelize.query(
			`SELECT CustomerName AS name FROM Customers
       UNION
       SELECT name FROM directory_users
       ORDER BY name`
		)
		return rows
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function getAll() {
	try {
		const [rows] = await sequelize.query(
			`SELECT CustomerName AS name FROM Customers
       UNION ALL
       SELECT name FROM directory_users
       ORDER BY name`
		)
		return rows
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function getByLast() {
	try {
		const [rows] = await sequelize.query(
			`SELECT last_name AS name FROM Customers WHERE last_name IS NOT NULL
       UNION
       SELECT name FROM directory_users
       ORDER BY name`
		)
		return rows
	} catch (error) {
		console.error(error)
		return null
	}
}

export default { create, getUnique, getAll, getByLast }
