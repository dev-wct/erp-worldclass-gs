/**
 * INFRA_BaseRepository
 * ============================================================
 * Capa de Infraestructura: Repositorio Base Genérico (Patrón POO).
 *
 * Propósito:
 *  - Centralizar el 100% de la lógica CRUD estándar que antes se
 *    repetía en cada uno de los 10+ repositorios del ERP (~60% código duplicado).
 *  - Todos los repositorios específicos extienden esta clase y heredan
 *    las operaciones de persistencia sin reescribirlas.
 *  - Cada repositorio específico solo define:
 *      1. El nombre de la tabla (TABLE).
 *      2. La función de mapeo a su Entidad (toEntity).
 *      3. Los campos propios del registro (buildRecord).
 *      4. Métodos de búsqueda especializados propios del dominio.
 *
 * Anti-Vendor Locking:
 *  - NO usa SpreadsheetApp directamente. Toda la comunicación con
 *    Google Sheets pasa exclusivamente por DataAdapter.
 *  - Si mañana DataAdapter apunta a PostgreSQL o SQLite, los repositorios
 *    específicos no necesitan ningún cambio.
 *
 * Paradigmas:
 *  - POO   : Clase base con herencia. Los repos específicos son subclases.
 *  - LISP  : buildRecord actúa como función de transformación pura (sin efectos secundarios).
 *  - COBOL : Cada operación trabaja sobre un "registro" (objeto plano) bien definido.
 * ============================================================
 */
class BaseRepository {

  /**
   * @param {string}   tableName - Nombre exacto de la hoja/tabla en Google Sheets.
   * @param {Function} toEntity  - Función que convierte un registro plano en una Entidad de dominio.
   *                               Ej: (raw) => LeadEntity.create(raw)
   */
  constructor(tableName, toEntity) {
    if (!tableName) throw new InfrastructureError('BaseRepository requiere un nombre de tabla.');
    if (typeof toEntity !== 'function') throw new InfrastructureError('BaseRepository requiere una función toEntity.');
    this.tableName = tableName;
    this._toEntity = toEntity;
  }

  // ─── LECTURA ────────────────────────────────────────────────────────────────

  /**
   * Retorna todos los registros de la tabla, mapeados a Entidades de dominio.
   * @param {object} [filters] - Filtros clave-valor opcionales (equivalente a WHERE en SQL).
   * @returns {Array<object>}
   */
  findAll(filters) {
    const list = DataAdapter.findAll(this.tableName, filters);
    return list.map(this._toEntity);
  }

  /**
   * Retorna un único registro por su clave primaria.
   * @param {number|string} id
   * @returns {object|null}
   */
  findById(id) {
    const raw = DataAdapter.findById(this.tableName, id);
    return raw ? this._toEntity(raw) : null;
  }

  /**
   * Retorna todos los registros que coincidan con un campo y valor específicos.
   * @param {string} field - Nombre del campo/columna.
   * @param {*}      value - Valor a buscar.
   * @returns {Array<object>}
   */
  findByField(field, value) {
    return DataAdapter.findByField(this.tableName, field, value).map(this._toEntity);
  }

  // ─── ESCRITURA ───────────────────────────────────────────────────────────────

  /**
   * Inserta un nuevo registro en la tabla.
   * Inyecta automáticamente: id, created_at, updated_at, created_by.
   *
   * La subclase debe implementar buildRecord(id, entity, now, user) para
   * definir los campos específicos del registro de dominio.
   *
   * @param {object} entity - Entidad de dominio con los datos del negocio.
   * @param {string} user   - Email del usuario autenticado (auditoría).
   * @returns {object}      - El registro tal como fue persistido.
   */
  insert(entity, user) {
    const id  = DataAdapter.getNextId(this.tableName);
    const now = DataAdapter.now();
    const record = this.buildRecord(id, entity, now, user);
    DataAdapter.insert(this.tableName, record);
    return record;
  }

  /**
   * Actualiza campos específicos de un registro existente.
   * Inyecta automáticamente updated_at.
   *
   * @param {number|string} id     - Clave primaria del registro a actualizar.
   * @param {object}        fields - Campos a actualizar (clave-valor).
   * @returns {boolean}            - true si se actualizó correctamente.
   */
  update(id, fields) {
    return DataAdapter.update(this.tableName, id, Object.assign({}, fields, {
      updated_at: DataAdapter.now()
    }));
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  /**
   * Retorna el siguiente ID disponible para esta tabla.
   * @returns {number}
   */
  nextId() {
    return DataAdapter.getNextId(this.tableName);
  }

  /**
   * Método abstracto que DEBE ser implementado por cada subclase.
   * Define la estructura exacta del registro a persistir en la tabla.
   *
   * @param {number} id     - ID autogenerado por el BaseRepository.
   * @param {object} entity - Entidad de dominio con los datos de negocio.
   * @param {Date}   now    - Timestamp actual (para auditoría).
   * @param {string} user   - Email del usuario autenticado.
   * @returns {object}      - Objeto plano listo para ser persistido.
   */
  buildRecord(id, entity, now, user) {
    throw new InfrastructureError(
      'El repositorio [' + this.tableName + '] debe implementar buildRecord().'
    );
  }
}
