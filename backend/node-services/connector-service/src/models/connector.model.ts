import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Connector",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      config: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      refreshFreq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "CREATED",
      },
    },
    {
      timestamps: true,
    }
  );