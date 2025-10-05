# ARKHA Documentation

Esta carpeta contiene toda la documentación técnica del proyecto ARKHA.

## Estructura de Documentación

### Base de Datos
- [`database-schema.md`](./database-schema.md) - Documentación completa del esquema de la base de datos
- [`supabase-setup.sql`](./supabase-setup.sql) - Script SQL para configurar la base de datos en Supabase

### Tipos TypeScript
- [`../src/types/database.ts`](../src/types/database.ts) - Tipos TypeScript que reflejan el esquema de la DB

## Cómo usar esta documentación

### Para desarrolladores nuevos
1. Lee `database-schema.md` para entender la estructura de datos
2. Revisa `../src/types/database.ts` para los tipos TypeScript
3. Usa `supabase-setup.sql` para configurar tu entorno local

### Para cambios en la base de datos
1. Actualiza `database-schema.md` con los cambios
2. Modifica `supabase-setup.sql` con los nuevos scripts
3. Actualiza `../src/types/database.ts` con los nuevos tipos
4. Ejecuta los scripts en Supabase

### Para mantener sincronización
- **Siempre** actualiza la documentación cuando cambies la base de datos
- **Verifica** que los tipos TypeScript coincidan con el esquema real
- **Testa** los scripts SQL antes de aplicarlos en producción

## Convenciones

### Nombres de tablas
- En minúsculas
- Separados por guiones bajos (`_`)
- Plurales (ej: `users`, `missions`, `modules`)

### Nombres de campos
- En minúsculas
- Separados por guiones bajos (`_`)
- Descriptivos (ej: `user_id`, `created_at`, `is_public`)

### Tipos de datos
- `UUID` para identificadores únicos
- `TEXT` para strings de longitud variable
- `INTEGER` para números enteros
- `BOOLEAN` para valores true/false
- `JSONB` para datos estructurados (posiciones 3D, etc.)
- `TIMESTAMP WITH TIME ZONE` para fechas

### Restricciones
- Usar `CHECK` constraints para validar valores
- Usar `FOREIGN KEY` para relaciones
- Usar `UNIQUE` para campos únicos
- Usar `NOT NULL` para campos obligatorios

## Enlaces útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
