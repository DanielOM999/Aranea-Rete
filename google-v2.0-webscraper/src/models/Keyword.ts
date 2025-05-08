import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

export class Keyword extends Model {
  declare id: string;
  declare word: string;
  declare documents_containing_word: number;

  // Initialiserer modellen og definerer dens struktur
  static initializeModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID, // UUID-type for id
          defaultValue: DataTypes.UUIDV4, // Genererer automatisk UUIDV4
          primaryKey: true, // Setter id som primærnøkkel
        },
        word: {
          type: DataTypes.STRING(45), // Maks 45 tegn for ordet
          unique: true, // Sørger for at hvert ord er unikt
        },
        documents_containing_word: {
          type: DataTypes.BIGINT, // Bruker BIGINT for å håndtere store tall
        },
      },
      {
        sequelize, // Knytter modellen til Sequelize-instansen
        modelName: "keyword", // Navnet på modellen
        tableName: "keywords", // Navnet på tabellen i databasen
        timestamps: false, // Deaktiverer automatisk opprettelse av tidsstempler
      }
    );
  }
}
