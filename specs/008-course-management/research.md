# Research: Course Management Module (008)

## 1. Signed URL Strategy for Private Video Bucket

**Decision**: Generate signed URLs server-side via `supabase.storage.from('course-videos').createSignedUrl(path, 3600)` on each lesson page load. Never cache signed URLs in client state or localStorage.

**Rationale**: The private `course-videos` bucket requires authenticated access. Signed URLs expire after 1 hour. Generating them fresh on load is the simplest correct approach at the current scale.

**Alternatives considered**:
- Edge Function to proxy video streaming — rejected, adds infrastructure complexity with no benefit at this scale.
- Client-side URL caching — rejected, risks serving expired URLs and leaking paths.

---

## 2. Video Player Protection

**Decision**: Use the native HTML5 `<video>` element with `controlsList="nodownload"` and `disablePictureInPicture` attributes. No third-party video player library.

**Rationale**: The requirement is straightforward attribute-level protection. A third-party player (e.g., Plyr, Video.js) would introduce a new dependency not justified by the current feature set.

**Alternatives considered**:
- Plyr.js — rejected, new major dependency, not in package.json.
- Video.js — rejected, same reason.

---

## 3. Section/Lesson Reordering

**Decision**: Use up/down arrow button controls to reorder sections and lessons. On each move, recalculate sort_order for all siblings and batch-update to Supabase.

**Rationale**: Drag-and-drop (e.g., react-beautiful-dnd) would require a new dependency. Arrow button reordering delivers the requirement with zero new packages.

**Alternatives considered**:
- react-beautiful-dnd — rejected, new dependency not in package.json.
- react-sortable-hoc — rejected, same reason.

---

## 4. Slug Auto-Generation

**Decision**: Derive slug from title in the Formik `onChange` handler using a pure string transform: lowercase, replace non-alphanumeric with hyphens, collapse consecutive hyphens, trim leading/trailing hyphens. On collision, the service appends `-2`, `-3`, etc., checked via Supabase query.

**Rationale**: No slug library needed. The transform is simple and consistent with existing slug patterns in the codebase.

**Alternatives considered**:
- `slugify` npm package — rejected, not in package.json, transform is trivially implementable inline.

---

## 5. Thumbnail Storage Bucket

**Decision**: Use the `course-thumbnails` Supabase Storage bucket (public). Upload path: `{courseId}/{filename}`. Retrieve URL via `supabase.storage.from('course-thumbnails').getPublicUrl(path)`.

**Rationale**: Course thumbnails are intentionally public (displayed in course listings). A separate bucket from `avatars` keeps concerns isolated and bucket policies clear.

**Constitution note**: The constitution's Principle X defaults to the `avatars` bucket but explicitly requires bucket policies to be reviewed per feature. The `course-thumbnails` public bucket is justified by the public display requirement.

---

## 6. Video Duration Auto-Detection

**Decision**: On video file selection, load the file into an in-memory `<video>` element and read `videoElement.duration` from the `loadedmetadata` event. Write the value (in seconds, rounded) to the Formik `duration` field. The user can override it manually.

**Rationale**: No library needed. The HTML5 API provides duration reliably for common video formats (mp4, webm, mov).

**Alternatives considered**:
- ffmpeg.wasm for server-side detection — rejected, heavy WASM dependency, overkill for metadata read.

---

## 7. Enrollment Progress Calculation

**Decision**: Progress percentage is calculated client-side on display:
`Math.round((completedLessonsCount / totalLessonsCount) * 100)`. Both counts come from the enrollment query (join lesson_progress + lessons per course).

**Rationale**: No database-stored computed column needed. At current scale, computing this in the query/client is sufficient.

**Alternatives considered**:
- Postgres computed column or trigger — rejected, adds migration complexity; overkill for admin-only display.

---

## 8. Course Deletion Guard

**Decision**: Before executing a delete, the repository checks for existing enrollments via a count query. If count > 0, throw a user-facing error: "This course has active enrollments and cannot be deleted. Remove all enrollments first."

**Rationale**: This aligns with the spec assumption (block deletion, don't cascade). Prevents accidental data loss.

---

## 9. MVC Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Model (`*.ts`) | TypeScript type/interface definitions only |
| Repository (`*Repository.ts`) | Raw Supabase queries — select, insert, update, delete |
| Service (`*Service.ts`) | Business logic — validation, slug collision, deletion guards, progress calc |
| Controller (`use*Controller.ts`) | React Query hooks + mutation wrappers consumed by page components |

This matches the established pattern from `004-user-management-mvc` and `006-direct-messages`.

---

## 10. i18n Approach

**Decision**: All user-facing strings use `intl.formatMessage()` or `<FormattedMessage />`. New keys added to `src/_metronic/i18n/` for all supported locales. Label keys follow the pattern `COURSE_MANAGEMENT.{SECTION}.{KEY}`.

**Rationale**: Constitution Principle VIII is mandatory — no hardcoded English strings.
