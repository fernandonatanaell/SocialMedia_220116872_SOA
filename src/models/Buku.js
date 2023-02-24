// shortcut type "mdl"

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Buku extends Model {
        static associate(models) {}
    }
    Buku.init(
        {
            buku_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            buku_nama: {
                type: DataTypes.VARCHAR
            },
            buku_tahun_terbit: {
                type: DataTypes.INTEGER
            }
        },
        {
        sequelize,
        modelName: 'Buku',
        }
    );
    return Buku;
};
