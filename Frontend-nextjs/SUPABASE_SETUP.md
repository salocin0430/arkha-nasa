# 🔧 Configuración de Supabase

## ⚠️ Problema Identificado
Las misiones se están creando en Supabase pero no se están listando en la aplicación porque **faltan las variables de entorno de Supabase**.

## 🚀 Solución

### 1. Crear archivo `.env.local`
Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 2. Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Ejemplo de configuración
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Reiniciar el servidor
Después de crear el archivo `.env.local`:

```bash
# Detener el servidor actual
pkill -f "next dev"

# Iniciar el servidor nuevamente
npm run dev
```

## 🔍 Verificación

Una vez configurado, deberías ver en la consola del navegador:
- `SupabaseClient: URL: https://tu-proyecto.supabase.co`
- `SupabaseClient: Anon Key: Present`

## 📋 Pasos para verificar que funciona

1. **Crear archivo `.env.local`** con las credenciales de Supabase
2. **Reiniciar el servidor** (`npm run dev`)
3. **Abrir la aplicación** en el navegador
4. **Hacer login** con tu usuario
5. **Ir al dashboard** - deberías ver tus misiones
6. **Verificar la consola** del navegador para logs de debug

## 🐛 Debug

Si sigues teniendo problemas, revisa:
- ✅ Archivo `.env.local` existe y tiene las credenciales correctas
- ✅ Variables de entorno empiezan con `NEXT_PUBLIC_`
- ✅ No hay espacios extra en las credenciales
- ✅ El servidor se reinició después de crear el archivo
- ✅ Las credenciales son correctas en Supabase Dashboard
