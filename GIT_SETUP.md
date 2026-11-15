# 📝 Instrucciones para Conectar el Repositorio Remoto

## ✅ Estado Actual

El repositorio local está inicializado y listo:

- ✅ Git inicializado en: `/Users/marcorodriguez/Documents/Projects/inmobi/realestate-crm`
- ✅ Rama principal: `main`
- ✅ Primer commit realizado: `d040773`
- ✅ 79 archivos commiteados (27,653 líneas)
- ✅ Working tree limpio (sin cambios pendientes)

**Commit inicial incluye:**
- Angular 22 con todas las features (Fases 1-14)
- README didáctico completo en español
- 92 tests pasando
- Arquitectura NgRx + SignalStore
- Componentes PrimeNG + Material

---

## 🚀 Pasos para Agregar Repositorio Remoto

### Opción 1: GitHub

#### 1.1 Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en "+" → "New repository"
3. Nombre sugerido: `angular-crm-enterprise` o `realestate-crm`
4. **NO inicialices** con README, .gitignore o licencia (ya los tenemos)
5. Click "Create repository"

#### 1.2 Conectar y hacer push

```bash
cd /Users/marcorodriguez/Documents/Projects/inmobi/realestate-crm

# Agregar remote (reemplaza <USERNAME> con tu usuario de GitHub)
git remote add origin https://github.com/<USERNAME>/realestate-crm.git

# O si usas SSH (recomendado)
git remote add origin git@github.com:<USERNAME>/realestate-crm.git

# Verificar remote
git remote -v

# Push inicial
git push -u origin main
```

---

### Opción 2: GitLab

#### 2.1 Crear proyecto en GitLab

1. Ve a [gitlab.com](https://gitlab.com)
2. Click en "New project" → "Create blank project"
3. Nombre: `realestate-crm`
4. Visibilidad: Private o Public
5. **Desmarca** "Initialize repository with a README"
6. Click "Create project"

#### 2.2 Conectar y hacer push

```bash
cd /Users/marcorodriguez/Documents/Projects/inmobi/realestate-crm

# Agregar remote (reemplaza <USERNAME> con tu usuario)
git remote add origin https://gitlab.com/<USERNAME>/realestate-crm.git

# O con SSH
git remote add origin git@gitlab.com:<USERNAME>/realestate-crm.git

# Push inicial
git push -u origin main
```

---

### Opción 3: Bitbucket

#### 3.1 Crear repositorio en Bitbucket

1. Ve a [bitbucket.org](https://bitbucket.org)
2. Click en "Create" → "Repository"
3. Nombre: `realestate-crm`
4. Desmarca "Include a README"
5. Click "Create repository"

#### 3.2 Conectar y hacer push

```bash
cd /Users/marcorodriguez/Documents/Projects/inmobi/realestate-crm

# Agregar remote
git remote add origin https://<USERNAME>@bitbucket.org/<USERNAME>/realestate-crm.git

# Push inicial
git push -u origin main
```

---

## 🔑 Configuración de SSH (Recomendado)

Si aún no tienes una SSH key configurada:

```bash
# Generar nueva SSH key
ssh-keygen -t ed25519 -C "tu_email@example.com"

# Iniciar ssh-agent
eval "$(ssh-agent -s)"

# Agregar key al agent
ssh-add ~/.ssh/id_ed25519

# Copiar clave pública (macOS)
pbcopy < ~/.ssh/id_ed25519.pub

# Ahora agrega esta clave en:
# GitHub: Settings → SSH and GPG keys → New SSH key
# GitLab: Preferences → SSH Keys
# Bitbucket: Personal settings → SSH keys
```

---

## ✅ Verificación Post-Push

Después de hacer el push, verifica que todo esté correcto:

```bash
# Ver remotes configurados
git remote -v

# Ver historial
git log --oneline

# Ver rama actual
git branch -a

# Verificar que main está tracking origin/main
git status
```

Deberías ver:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

## 📊 Comandos Git Útiles para el Futuro

```bash
# Ver status
git status

# Agregar cambios específicos
git add src/app/features/new-feature/

# Agregar todos los cambios
git add .

# Commit con mensaje
git commit -m "feat: add new feature"

# Push a la rama actual
git push

# Pull cambios del remoto
git pull

# Ver diferencias antes de commit
git diff

# Ver log completo
git log --oneline --graph --all

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver todas las ramas
git branch -a
```

---

## 🏷️ Convención de Commits (Recomendada)

Para mantener un historial limpio, usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar nueva funcionalidad
fix: corregir bug en el filtro de propiedades
docs: actualizar README con nuevas instrucciones
style: formatear código con Prettier
refactor: reorganizar estructura de dashboard
test: agregar tests para property service
chore: actualizar dependencias
perf: optimizar carga de imágenes
```

**Ejemplos:**
```bash
git commit -m "feat: add authentication module with JWT"
git commit -m "fix: resolve date picker timezone issue"
git commit -m "docs: add API documentation for properties endpoint"
git commit -m "test: add unit tests for dashboard reducer"
```

---

## 🎯 Próximos Pasos

Una vez que hayas conectado el repositorio remoto:

1. ✅ Verifica que el README se vea correctamente en GitHub/GitLab
2. ✅ Configura branch protection rules para `main` (requiere PRs)
3. ✅ Agrega Topics/Tags al repositorio: `angular`, `ngrx`, `typescript`, `crm`, `primeng`
4. ✅ Considera crear un `.github/workflows/ci.yml` para CI/CD
5. ✅ Agrega badges al README (build status, coverage, etc.)

---

## 🆘 Solución de Problemas

### Error: "remote origin already exists"

```bash
# Ver el remote existente
git remote -v

# Removerlo
git remote remove origin

# Agregar el nuevo
git remote add origin <nueva-url>
```

### Error: "failed to push some refs"

```bash
# Si el repositorio remoto tiene commits que no tienes localmente
git pull origin main --rebase

# Luego push
git push -u origin main
```

### Cambiar la URL del remote

```bash
# HTTPS → SSH
git remote set-url origin git@github.com:<USERNAME>/realestate-crm.git

# SSH → HTTPS
git remote set-url origin https://github.com/<USERNAME>/realestate-crm.git
```

---

**¿Listo para hacer el push?** Solo necesitas:

1. Crear el repositorio en tu plataforma preferida (GitHub/GitLab/Bitbucket)
2. Copiar la URL del repositorio
3. Ejecutar:
   ```bash
   git remote add origin <URL>
   git push -u origin main
   ```

¡Y listo! 🚀
