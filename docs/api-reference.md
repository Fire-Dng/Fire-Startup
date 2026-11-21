# Tài liệu API Backend

Tài liệu này mô tả **implementation hiện tại** trong `backend/src` để hỗ trợ tích hợp và cải tạo frontend. Quyền truy cập bên dưới được suy ra từ middleware đang gắn vào từng route; nếu khác với chú thích trong code thì tài liệu ghi theo middleware thực tế.

- Base path: `/api` (chưa có version prefix).
- Backend hiện mount 33 endpoint dưới `/api`; static media `/uploads/*` được mô tả riêng.
- Base URL lấy từ `BACKEND_PUBLIC_URL`; môi trường local mặc định `http://localhost:5000`.
- Request body JSON và URL-encoded có giới hạn 5 MB.
- Upload file multipart giới hạn theo `UPLOAD_MAX_FILE_SIZE_MB` (mặc định 5 MB).
- API trả JSON theo envelope chung bên dưới, ngoại trừ nội dung file tĩnh `/uploads/*` và request upload trực tiếp lên S3.

## 1. Quy ước chung

### 1.1 Response format

Thành công:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}
```

`meta` chỉ có ở endpoint trả danh sách/phân trang. Lỗi:

```json
{
  "success": false,
  "message": "...",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```

`details` có thể là mảng thông báo validation hoặc dữ liệu bổ sung cho lỗi tồn kho; rate limit có thể không có `details`.

### 1.2 Ngôn ngữ thông báo

Các message API hỗ trợ tiếng Việt và tiếng Anh. Ưu tiên `?lang=en`; nếu không có thì đọc header `Accept-Language` bắt đầu bằng `en`; mặc định là `vi`. Tham số ngôn ngữ chỉ đổi thông báo, không đổi tên field hay dữ liệu.

### 1.3 Authentication và role

Gửi JWT như sau:

```http
Authorization: Bearer <token>
```

Role được định nghĩa trong user là `customer`, `staff`, `admin`.

- `verifyToken`: cần token còn hiệu lực và user còn active; thiếu/sai/hết hạn trả 401.
- `requireRole(...)`: sau `verifyToken`, chỉ cho các role được nêu; sai role trả 403.
- `optionalAuth`: không bắt buộc đăng nhập. Token thiếu, hết hạn, sai hoặc user inactive đều được xem như guest và request vẫn đi tiếp.
- Các route chỉ gắn `optionalAuth` **không tự giới hạn** quyền khách hàng, nhân viên hay admin.

### 1.4 Hạn mức và middleware dùng chung

- Toàn bộ `/api/*`: tối đa 1.500 request/IP trong 15 phút.
- `POST /api/auth/register` và `POST /api/auth/login`: thêm limiter dùng chung tối đa 200 request/IP trong 15 phút.
- Response limiter: HTTP 429, code `TOO_MANY_REQUESTS` hoặc `AUTH_RATE_LIMIT`.
- Middleware loại bỏ key bắt đầu bằng `$` hoặc chứa dấu `.` khỏi body, query và params.
- CORS được bật trong Express; callback hiện kết thúc bằng cách chấp nhận mọi origin, nên `CORS_ORIGIN` chưa thực sự giới hạn origin trong implementation hiện tại.

### 1.5 Lỗi phổ biến

| HTTP | Code thường gặp | Ý nghĩa |
|---:|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_ID`, `INVALID_STATUS_TRANSITION`, `INVALID_PLACEMENTS`, ... | Dữ liệu không hợp lệ, ID sai hoặc quy tắc nghiệp vụ không thỏa |
| 401 | `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `USER_INACTIVE` | Cần đăng nhập hoặc token/user không còn hợp lệ |
| 403 | `FORBIDDEN`, `PHONE_MISMATCH` | Role không đủ quyền hoặc số điện thoại không khớp |
| 404 | `NOT_FOUND`, `PRODUCT_NOT_FOUND`, `MATERIAL_NOT_FOUND`, `ORDER_NOT_FOUND`, `DESIGN_NOT_FOUND` | Không tìm thấy route/tài nguyên |
| 409 | `DUPLICATE_KEY`, `EMAIL_EXISTS` | Giá trị unique đã tồn tại |
| 429 | `TOO_MANY_REQUESTS`, `AUTH_RATE_LIMIT` | Vượt hạn mức |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi không được ánh xạ cụ thể |

## 2. Bản đồ route và phân chia Client/Admin

### 2.1 Client/public

Các route này không cần quyền admin. Một số route nhận token tùy chọn để gắn tài khoản vào thiết kế/đơn hàng.

| Method | Path | Quyền hiện tại | Mục đích |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| GET | `/api/ping` | Public | Alias health check |
| POST | `/api/auth/register` | Public | Tạo tài khoản customer |
| POST | `/api/auth/login` | Public | Đăng nhập |
| GET | `/api/auth/me` | Bearer bắt buộc | Lấy user hiện tại |
| GET | `/api/content/landing` | Public | Nội dung landing và dữ liệu nổi bật |
| GET | `/api/products` | Public | Danh sách sản phẩm |
| GET | `/api/products/:slug` | Public | Chi tiết sản phẩm |
| GET | `/api/materials` | Public | Danh sách nguyên liệu |
| POST | `/api/custom-designs/calculate-price` | Public | Tính giá thiết kế 3D |
| POST | `/api/custom-designs` | `optionalAuth` | Lưu thiết kế, gắn user nếu token hợp lệ |
| GET | `/api/custom-designs/:idOrShareCode` | Public | Đọc thiết kế bằng ID/share code |
| POST | `/api/orders` | `optionalAuth` | Đặt hàng guest hoặc user |
| GET | `/api/orders/lookup/:orderCode` | Public | Tra cứu đơn theo mã, có thể đối chiếu phone |
| POST | `/api/orders/:orderCode/cancel` | `optionalAuth` | Yêu cầu hủy đơn |
| GET | `/api/media/status` | Public | Trạng thái storage và cấu hình upload |
| POST | `/api/media/presigned-url` | Guest chỉ được `custom-previews`; folder khác cần staff/admin | Tạo thông tin upload |
| POST | `/api/media/upload` | Guest chỉ được `custom-previews`; folder khác cần staff/admin | Upload qua backend |
| GET/HEAD | `/uploads/*` | Public static file | Đọc file local fallback |

### 2.2 Admin được bảo vệ bằng middleware hiện tại

| Method | Path | Role |
|---|---|---|
| PUT | `/api/content/landing` | `admin`, `staff` |
| POST | `/api/products` | `admin` |
| PUT | `/api/products/:id` | `admin` |
| DELETE | `/api/products/:id` | `admin` |
| GET | `/api/admin/dashboard` | `admin`, `staff` |
| GET | `/api/admin/landing` | `admin`, `staff` |
| PUT | `/api/admin/landing` | `admin`, `staff` |
| DELETE | `/api/media` | `admin`, `staff` |
| POST | `/api/media/presigned-url` | `admin`, `staff` với folder `landing`, `products`, `materials` |
| POST | `/api/media/upload` | `admin`, `staff` với folder `landing`, `products`, `materials` |

`/api/admin/landing` là alias có bảo vệ của chức năng `/api/content/landing`: GET và PUT dùng cùng controller/content schema.

### 2.3 Route quản trị/ CMS nhưng hiện chưa được bảo vệ role

Các route sau thường được frontend CMS sử dụng, nhưng implementation hiện tại chỉ gắn `optionalAuth` hoặc không gắn auth. Vì vậy guest cũng có thể gọi được; gửi JWT không biến chúng thành admin-only.

| Method | Path | Middleware thực tế | Ghi chú |
|---|---|---|---|
| POST | `/api/materials` | `optionalAuth` | Guest có thể tạo nguyên liệu |
| PUT | `/api/materials/:id` | `optionalAuth` | Guest có thể sửa nguyên liệu |
| DELETE | `/api/materials/:id` | `optionalAuth` | Guest có thể xóa nguyên liệu |
| GET | `/api/orders` | `optionalAuth` | Guest có thể đọc danh sách mọi đơn |
| GET | `/api/orders/:id` | `optionalAuth` | Không lọc theo chủ đơn |
| PATCH | `/api/orders/:id/status` | `optionalAuth` | Guest có thể đổi trạng thái nếu transition hợp lệ |
| PATCH | `/api/orders/:id/payment` | `optionalAuth` | Guest có thể đổi trạng thái thanh toán |

**Lưu ý cho frontend:** ẩn nút admin trên giao diện không thay thế kiểm soát quyền phía API. Không dựa vào frontend để bảo vệ các thao tác trên; cần tính đến trạng thái backend này khi tích hợp. Bảng ở đây ghi đúng hành vi hiện tại, không phải quyền mong muốn.

## 3. API Client/Public

### 3.1 Health check

#### `GET /api/health` và `GET /api/ping`

Hai path dùng cùng handler; không có path param hay request body. Có thể truyền `lang` chung.

Response `data` gồm:

| Field | Kiểu | Ý nghĩa |
|---|---|---|
| `status` | string | Trạng thái API, hiện là `ok` |
| `awakeStatus` | string | Trạng thái keep-alive, hiện là `awake` |
| `uptime` | number | Thời gian process chạy, giây |
| `intervalMinutes` | number | Chu kỳ keep-alive cấu hình |
| `keepAlive` | object | Trạng thái keep-alive hiện tại |
| `timestamp` | ISO date string | Thời điểm xử lý request |
| `environment` | string | `NODE_ENV` |

HTTP 200. Ví dụ: `GET /api/health?lang=en`.

### 3.2 Authentication

#### `POST /api/auth/register`

Public; chịu cả global rate limit và auth rate limit. `Content-Type: application/json`.

| Body field | Kiểu | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `fullName` | string | Có | Trim qua Mongoose |
| `email` | string | Có | Trim, lowercase, unique; không có validator định dạng email riêng |
| `password` | string | Có | Tối thiểu 6 ký tự; lưu hash |
| `phone` | string | Không | Mặc định chuỗi rỗng |

HTTP 201; `data` gồm `{ token, user }`. User trả về gồm `_id`, `fullName`, `email`, `phone`, `role` (`customer`). Lỗi: `MISSING_FIELDS` 400, `EMAIL_EXISTS`/`DUPLICATE_KEY` 409, lỗi schema 400, rate limit 429.

Ví dụ body:

```json
{
  "fullName": "Nguyễn An",
  "email": "an@example.com",
  "password": "secret123",
  "phone": "0900000000"
}
```

#### `POST /api/auth/login`

Public, có auth rate limit. Body: `email` (string, bắt buộc), `password` (string, bắt buộc). Email được trim/lowercase trước khi tra cứu.

HTTP 200; `data` gồm `{ token, user }`; user gồm `_id`, `fullName`, `email`, `phone`, `role`, `address`. Lỗi: `MISSING_CREDENTIALS` 400, `INVALID_CREDENTIALS` 401, `USER_LOCKED` 403, rate limit 429.

#### `GET /api/auth/me`

Bearer bắt buộc; không có query/body riêng. HTTP 200 trả user hiện tại, không trả password. Các field theo user document: `_id`, `fullName`, `email`, `phone`, `role`, `avatar`, `address`, `isActive`, `createdAt`, `updatedAt`. Lỗi token 401.

### 3.3 Landing content

#### `GET /api/content/landing`

Public; không có path/body param. Trả document `main_landing` và các dữ liệu tính khi đọc:

- `featuredProducts`: tối đa 6 sản phẩm active, sắp xếp featured/soldCount/createdAt.
- `featuredMaterials`: tối đa 12 nguyên liệu active.
- `liveEcoMetrics.additionalNetRecycledGrams`: tổng `totalNetWeightGrams` từ đơn không cancelled.
- `liveEcoMetrics.totalOrdersPlaced`: số đơn không cancelled.

Nếu chưa có landing document, GET tự tạo document với giá trị mặc định. `data` còn có `key`, `hero`, `heroBanner`, `impactStats`, `processSteps`, `recyclingSteps`, `galleryImages`, `studioHighlight`, `artisanStory`, `artisanStories`, `seo`, timestamps.

#### `PUT /api/content/landing`

Bearer + role `admin` hoặc `staff`. Body JSON cập nhật từng phần; gửi object con để cập nhật các field của object đó.

| Body field | Cấu trúc |
|---|---|
| `hero` | Object string: `badgeText`, `title`, `subtitle`, `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink`, `heroImage`, `secondaryImageUrl`, `tertiaryImageUrl` |
| `heroBanner` | Object string: `backgroundImageUrl`, `secondaryImageUrl`, `tertiaryImageUrl` |
| `impactStats` | Object number: `ghostNetsCollectedKg`, `marineLifeProtected`, `upcycledProductsCreated`, `localArtisansSupported` |
| `processSteps`, `recyclingSteps` | Mảng `{stepNumber, title, description, iconName, metricLabel, imageUrl}`; stepNumber là number, còn lại string |
| `galleryImages` | Mảng string URL |
| `studioHighlight` | `{headline: string, description: string, features: string[]}` |
| `artisanStory` | String fields `name`, `role`, `village`, `quote`, `avatarUrl`, `workshopImageUrl` |
| `artisanStories` | Mảng `{name, role, village, quote, avatar: string, yearsOfCraft: number}` |
| `seo` | `{metaTitle: string, metaDescription: string}` |

Các object lồng nhau được merge nông; arrays được thay toàn bộ. Nếu chỉ gửi `hero.heroImage` hoặc `heroBanner.backgroundImageUrl`, ảnh nền tương ứng được đồng bộ qua lại; hai ảnh phụ cũng vậy. Nếu chỉ gửi `processSteps` hoặc chỉ `recyclingSteps`, controller sao chép mảng đó sang field còn lại. Field ngoài schema bị Mongoose strict mode bỏ qua. HTTP 200 trả landing document đã lưu (không kèm computed featured/metrics như GET).

Ví dụ:

```json
{
  "hero": { "title": "Thiết kế từ vật liệu tái sinh" },
  "impactStats": { "marineLifeProtected": 16000 }
}
```

### 3.4 Products

#### Schema body dùng cho tạo/cập nhật sản phẩm

| Field | Kiểu | Required / default / validation |
|---|---|---|
| `name` | string | POST bắt buộc, trim |
| `slug` | string | Unique, lowercase, trim; POST tự tạo từ name nếu thiếu |
| `sku` | string | Mặc định `""` |
| `category` | string | Bắt buộc; enum `basket`, `bag`, `wallet`, `apparel`, `bracelet`, `accessory` |
| `shortDescription`, `description` | string | Mặc định `""` |
| `basePrice` | number | Bắt buộc, >= 0 |
| `craftFee` | number | >= 0, mặc định 0 |
| `stock` | number | >= 0, mặc định 20 |
| `images` | string[] | Mặc định `[]` |
| `thumbnail` | string | Mặc định `""` |
| `isCustomizable` | boolean | Mặc định true |
| `isFeatured` | boolean | Mặc định false |
| `isActive` | boolean | Mặc định true |
| `availableColors` | `{name, hex}[]` | Cả hai string bắt buộc trên từng phần tử; mặc định theme |
| `availableStrapColors` | `{name, hex}[]` | Cả hai string bắt buộc; mặc định theme |
| `availableSizes` | string[] | Mặc định `["Tiêu chuẩn"]` |
| `model3D` | object | `meshPreset`, `glbUrl`, `defaultBaseColor`, `defaultStrapColor`, `roughness`, `metalness`; preset enum `tote_bag`, `storage_basket`, `zip_wallet`, `eco_shirt`, `woven_bracelet`, `shell_charm_set` |
| `ecoImpact` | object | `netWeightGrams`, `recycledPlasticRatio`, `co2SavedGrams` numbers; `oceanOrigin`, `artisanGroup` strings |
| `soldCount` | number | Mặc định 0 |
| `rating` | number | Mặc định 4.9 |

Object `model3D` mặc định `meshPreset: tote_bag`, `glbUrl: ""`, roughness `0.75`, metalness `0.05`; màu mặc định lấy từ theme. `ecoImpact.netWeightGrams` mặc định 150, `recycledPlasticRatio` 92, `co2SavedGrams` 420; origin/artisan group có default trong model.

#### `GET /api/products`

Public; không body/path. Query:

| Query | Kiểu | Ý nghĩa |
|---|---|---|
| `category` | string | Lọc category; `all` bỏ lọc |
| `isCustomizable` | `true`/`false` | Lọc chính xác boolean nếu query có một trong hai giá trị |
| `isFeatured` | `true` | Chỉ lọc featured khi đúng literal `true` |
| `includeInactive` | `true` | Bỏ bộ lọc `isActive=true` |
| `search` | string | Tìm không phân biệt hoa thường trong name, shortDescription, description, slug |
| `minPrice`, `maxPrice` | number | Giới hạn inclusive trên `basePrice` |
| `sort` | string | `newest` mặc định; `price_asc`, `price_desc`, `popular` |
| `page` | integer | Mặc định 1, tối thiểu 1 |
| `limit` | integer | Mặc định 50, ép trong khoảng 1–100 |
| `lang` | string | Ngôn ngữ message |

HTTP 200: `data` là Product[], `meta` là `{page, limit, total, totalPages}`. `popular` sort theo `soldCount` giảm dần rồi `rating` giảm dần. `includeInactive=true` hiện được phép trên route public.

Ví dụ: `GET /api/products?category=bracelet&sort=popular&page=1&limit=20`.

#### `GET /api/products/:slug`

Public. `slug` là slug hoặc Mongo ObjectId 24 ký tự hex. Với ObjectId, backend thử tìm theo `_id` hoặc `slug`; slug thường được lowercase trước khi query.

HTTP 200 trả Product fields và `relatedProducts` (tối đa 4 sản phẩm active cùng category). Hiện tại lookup không lọc `isActive` cho sản phẩm chính, nên slug/ID của sản phẩm inactive vẫn có thể được đọc. Không có body; lỗi `PRODUCT_NOT_FOUND` 404, ID cast sai có thể 400.

### 3.5 Materials

#### Schema body dùng cho tạo/cập nhật nguyên liệu

| Field | Kiểu | Required / default / validation |
|---|---|---|
| `name` | string | Bắt buộc, trim |
| `code` | string | Bắt buộc, unique, uppercase, trim; POST tự sinh `MAT-xxxxx` nếu thiếu và có name |
| `materialType` | string | Bắt buộc; enum `shell`, `snail`, `charm`, `bead`, `cord` |
| `unitPrice` | number | Bắt buộc, >= 0 |
| `description` | string | Mặc định `""` |
| `stockQuantity` | number | >= 0, mặc định 100 |
| `lowStockThreshold` | number | Mặc định 10 |
| `thumbnail` | string | Mặc định `""` |
| `colorPalette` | string[] | Mặc định theme |
| `defaultColor` | string | Mặc định theme |
| `model3D` | object | `meshPreset` enum `scallop_shell`, `cockle_shell`, `cowrie_shell`, `spiral_snail`, `turban_snail`, `horn_snail`, `starfish_charm`, `seahorse_charm`, `turtle_charm`, `anchor_charm`, `pearl_bead`, `sea_glass_bead`, `wood_bead`, `fishing_cord_knot`; thêm `glbUrl`, `defaultScale`, `roughness`, `metalness` |
| `origin` | string | Có default theo model |
| `isActive` | boolean | Mặc định true |

`model3D.defaultScale` mặc định 1.0, roughness 0.35, metalness 0.15.

#### `GET /api/materials`

Public; query: `materialType` (enum trên hoặc `all` để bỏ lọc), `includeInactive=true` (bỏ lọc active), `search` (tìm name/code/description, không phân biệt hoa thường), `lang`. Không phân trang. HTTP 200 trả `data` đã sort theo `materialType`, `unitPrice`; `meta: {total}`.

#### `POST /api/materials`, `PUT /api/materials/:id`, `DELETE /api/materials/:id`

Body POST theo schema trên; PUT nhận partial body và chạy Mongoose validators. Path `id` là ObjectId. POST trả 201 Material, PUT trả 200 Material, DELETE trả 200 `{_id}`. Lỗi schema 400, trùng code 409, không tìm thấy khi update/delete 404.

**Quyền thực tế:** cả ba route chỉ dùng `optionalAuth`; guest có thể tạo/sửa/xóa. Đây là route admin-facing nhưng không được bảo vệ admin trong code hiện tại; xem mục 2.3.

### 3.6 Custom design / báo giá 3D

#### Contract `placements[]`

Mỗi phần tử có:

| Field | Kiểu / mặc định | Quy tắc |
|---|---|---|
| `materialId` | ObjectId string | Bắt buộc; material phải tồn tại và active |
| `position` | number[3], default `[0,0,0]` | Ba số hữu hạn `[x,y,z]` |
| `normal` | number[3], default `[0,0,1]` | Ba số hữu hạn; backend chuẩn hóa vector; vector zero thành `[0,0,1]` |
| `scale` | number, default 1 | Trong `[0.4, 2.5]` |
| `rotation` | number, default 0 | Giá trị không phải số được đưa về 0 |
| `slotIndex` | number hoặc null | Không có/không hợp lệ thành null |
| `placementId` | string | Tự sinh nếu thiếu |
| `color` | string | Mặc định rỗng trong input; output dùng màu material/theme nếu rỗng |
| `isDanglingCharm` | boolean | Ép theo truthiness |

Tối đa 50 placement trong mỗi thiết kế. Giá vật liệu tính theo số placement, đơn giá lấy từ database.

#### `POST /api/custom-designs/calculate-price`

Public. JSON body:

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `productId` | ObjectId string | Có | Product phải tồn tại |
| `placements` | array | Không | Mặc định `[]`; theo contract phía trên |

Backend trả HTTP 200 với `data: {productId, productName, pricingBreakdown, bomSummary, placementsCount}`. `pricingBreakdown` là `{basePrice, craftFee, materialsTotal, estimatedPrice}`; công thức `basePrice + craftFee + tổng unitPrice của từng placement`. `bomSummary` nhóm cùng material và gồm materialId/code/name/type/meshPreset/unitPrice/quantity/subtotal/availableStock.

Lỗi phổ biến: `MISSING_PRODUCT_ID`, `PRODUCT_NOT_FOUND` 404, `INVALID_PLACEMENTS`, `MAX_PLACEMENTS_EXCEEDED`, `MISSING_MATERIAL_ID`, `INVALID_POSITION`, `INVALID_NORMAL`, `INVALID_SCALE`, `MATERIAL_NOT_FOUND`, `MATERIAL_INACTIVE` (các lỗi validation nghiệp vụ trả 400).

#### `POST /api/custom-designs`

`optionalAuth`; đăng nhập hợp lệ thì design gắn `userId`, guest vẫn lưu được. Body nhận `productId` và `placements` như calculate-price, thêm:

| Field | Kiểu | Mặc định / giới hạn |
|---|---|---|
| `name` | string | `Custom <product name>` |
| `baseColor`, `strapColor` | string | Lấy từ product model3D/theme |
| `size` | string | Lấy size đầu tiên của product hoặc `Tiêu chuẩn` |
| `note` | string | `""` |
| `previewThumbnail` | string | Product thumbnail hoặc `""` |
| `braceletConfig` | object | `wristSizeCm` clamp 12–25, default 16; `slotCount` round và clamp 4–30, default 12; `cordMaterial` default `recycled_net_cord` |

Backend tự tính lại giá và sinh `shareCode` dạng `3D-XXXXXX`. Product phải `isCustomizable=true` (điều kiện này áp dụng khi lưu, không áp dụng trong calculate-price). HTTP 201 trả design đã populate `productId` (name/slug/category/price/thumbnail/model3D/ecoImpact). Lỗi giá/placement như trên và `NOT_CUSTOMIZABLE` 400.

#### `GET /api/custom-designs/:idOrShareCode`

Public; param là Mongo ObjectId 24 hex hoặc share code (không phân biệt case, backend uppercase khi tìm). HTTP 200 trả design, populate thông tin sản phẩm; 404 `DESIGN_NOT_FOUND`.

### 3.7 Client order flow

#### `POST /api/orders`

`optionalAuth`; guest được đặt hàng. Backend đọc catalog/database để tính lại giá và tồn kho; không dùng giá/BOM do client gửi.

Body:

```json
{
  "customerInfo": {
    "fullName": "Nguyễn An",
    "phone": "0900000000",
    "email": "an@example.com",
    "address": "12 đường A",
    "city": "Đà Nẵng",
    "note": "Giao giờ hành chính"
  },
  "items": [
    { "productId": "64b000000000000000000002", "quantity": 1 }
  ],
  "paymentMethod": "cod"
}
```

- `customerInfo` bắt buộc object có `fullName`, `phone`, `address`; `email`, `note` tùy chọn; `city` mặc định `Đà Nẵng`. Email lấy từ tài khoản nếu không gửi và user đăng nhập.
- `items` bắt buộc mảng không rỗng. Mỗi item cần `productId`, hoặc `customDesignId` để backend suy ra product; `quantity` mặc định 1, parse integer và phải >=1. Có thể gửi `selectedColor`, `selectedStrapColor`, `selectedSize`.
- Một item được tính custom nếu `isCustom: true`, có `customDesignId`, `customDesign`, `customDesignSnapshot`, hoặc `placements` không rỗng. Inline custom nhận placements, baseColor/strapColor/size/note/artisanNote/name/shareCode và `braceletConfig`; có thể đặt placements ở item hoặc trong object design. Nếu dùng `customDesignId`, backend đọc design đã lưu. Giá/BOM luôn tính lại từ material/product hiện hành.
- `paymentMethod` chỉ được giữ là `vietqr` khi giá trị đúng literal `vietqr`; mọi giá trị khác chuẩn hóa thành `cod`.
- Phí ship: 30.000 khi subtotal < 500.000; miễn phí từ 500.000. Backend trừ tồn product/material khi tạo đơn.

HTTP 201 trả order document gồm `orderCode`, `userId`, `customerInfo`, `items`, `status`, `statusHistory`, `paymentMethod`, `paymentStatus`, `vietqrInfo`, `subtotal`, `shippingFee`, `totalAmount`, `finalAmount`, `totalNetWeightGrams`, `inventoryDeducted`, timestamps. `vietqrInfo` chứa bank/account/amount/transferContent/qrImageUrl lấy từ cấu hình backend. Order code dạng `DTU-YYYYMMDD-XXXX`; status ban đầu `pending`, payment `unpaid`.

Lỗi: `INVALID_CUSTOMER_INFO`, `EMPTY_ORDER_ITEMS`, `INVALID_QUANTITY`, `MISSING_PRODUCT_ID`, `PRODUCT_UNAVAILABLE`, `INSUFFICIENT_PRODUCT_STOCK`, `MATERIAL_UNAVAILABLE`, `INSUFFICIENT_MATERIAL_STOCK`, lỗi concurrent stock 400; design đã lưu không tồn tại `DESIGN_NOT_FOUND` 404; validation/ID lỗi tương ứng.

#### `GET /api/orders/lookup/:orderCode`

Public. `orderCode` được trim và uppercase trước khi tìm. Query tùy chọn `phone`; nếu truyền thì phải khớp chính xác phone trong đơn sau trim, nếu sai trả `PHONE_MISMATCH` 403. Nếu bỏ phone thì mã đơn là đủ để tra cứu. HTTP 200 trả đầy đủ order document; không tìm thấy 404.

#### `POST /api/orders/:orderCode/cancel`

`optionalAuth`; param chấp nhận order code hoặc ObjectId. Body tùy chọn: `reason` (string, đưa vào lịch sử/cancelReason), `phone` (string; nếu gửi phải khớp phone của đơn). Phone hiện không bắt buộc và đăng nhập cũng không bắt buộc.

Hủy được khi đơn `pending` hoặc `confirmed`; backend hoàn tồn kho product/material. Không thể hủy từ `in_crafting`, `quality_check`, `shipping`, `delivered`. HTTP 200 trả order đã cập nhật; lỗi `ORDER_NOT_FOUND` 404, `PHONE_MISMATCH` 403, `CANNOT_CANCEL_IN_CRAFTING` 400. Gọi lại khi đã cancelled trả order hiện tại (không thêm lịch sử mới).

### 3.8 Media phía client

#### `GET /api/media/status`

Public; trả `storageMode` (`s3` hoặc `local-fallback`), `isS3Configured`, `bucket`, `region`, `publicBaseUrl`, `folders`, `allowedMimeTypes`, `maxFileSizeMb`, `presignedExpiresIn`.

#### Upload custom preview

`POST /api/media/presigned-url` và `POST /api/media/upload` cho phép guest với `folder: "custom-previews"`; các folder còn lại cần Bearer + role `admin`/`staff`.

Folder hợp lệ: `landing`, `products`, `materials`, `custom-previews`. MIME hợp lệ: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`.

`POST /api/media/presigned-url` nhận JSON:

| Field | Kiểu | Default |
|---|---|---|
| `folder` | string | `products` |
| `fileName` | string | `upload.jpg` |
| `mimeType` | string | `image/jpeg` |
| `contentType` | string | Chỉ fallback khi `mimeType` falsy |

Khi S3 hoạt động, response data có `storageMode: "s3"`, `uploadMethod: "PUT"`, `uploadUrl`, `publicUrl`, `key`, `folder`, `contentType`, `expiresIn`. Client PUT bytes trực tiếp đến `uploadUrl` và gửi đúng `Content-Type`.

Khi local fallback, response có `uploadMethod: "POST_MULTIPART"`, `uploadUrl` trỏ về `/api/media/upload`, cùng `publicUrl`, `key`, `folder`, `contentType`, `expiresIn`. **Lưu ý implementation:** endpoint upload local hiện sinh key mới và không nhận key từ response presigned; URL/key presigned có thể không phải file vừa upload. Với flow fallback, dùng `publicUrl`/`key` trong response thành công của `/api/media/upload` làm URL lưu vào product/design.

`POST /api/media/upload` hỗ trợ:

- `multipart/form-data`: field file bắt buộc tên `file`; `folder` tùy chọn.
- Hoặc JSON: `base64Data` (base64 hoặc data URL) bắt buộc nếu không có file; `fileName` default `upload.png`, `mimeType` default `image/png`, `folder` tùy chọn. JSON parser giới hạn toàn request 5 MB.

Upload trả HTTP 201, data gồm `storageMode`, `bucket`, `region`, `key`, `folder`, `mimeType`, `size`, `url`, `publicUrl`. Nếu muốn upload local fallback, gọi URL `uploadUrl` bằng multipart và gửi folder trong body. Lỗi: `MISSING_FILE`, `FILE_TOO_LARGE`, `UPLOAD_ERROR`, `INVALID_MEDIA_FOLDER`, `INVALID_MEDIA_MIME_TYPE`.

## 4. Admin API

### 4.1 Dashboard

#### `GET /api/admin/dashboard`

Bearer + role `staff` hoặc `admin`; không có query/body riêng (ngoài `lang`). HTTP 200 trả:

- `summary`: `totalRevenue`, `totalOrders`, `activeOrdersCount`, `customCraftingOrdersCount`, `totalProducts`, `totalMaterials`, `totalCustomDesigns`, `totalNetWeightGrams`, `ghostNetsCollectedKg`.
- `statusBreakdown`: số đơn theo `pending`, `confirmed`, `in_crafting`, `quality_check`, `shipping`, `delivered`, `cancelled`.
- `lowStockMaterials`: active materials với `stockQuantity <= 15`.
- `lowStockProducts`: active products với `stock <= 5`.
- `recentOrders`: tối đa 8 đơn mới nhất.

Cách tính hiện tại: `totalRevenue` cộng `totalAmount` của mọi đơn chưa cancelled, không chỉ đơn đã thanh toán; `totalOrders` bao gồm cả đơn cancelled. Ngưỡng low-stock của dashboard là hằng số 15/5, không dùng `lowStockThreshold` từng material.

### 4.2 Landing CMS

#### `GET /api/admin/landing`, `PUT /api/admin/landing`

Bearer + `staff`/`admin`. Hai route dùng cùng controller và request/response schema như `/api/content/landing` ở mục 3.3. GET trả cả featured data và live metrics; PUT nhận partial landing body.

### 4.3 Product management

#### `POST /api/products`

Bearer + role `admin`. Body theo Product schema ở mục 3.4; `name`, `category`, `basePrice` bắt buộc. Nếu thiếu slug, backend tạo slug từ name kèm hậu tố thời gian. HTTP 201 trả Product document. Lỗi `MISSING_NAME` 400, schema/enum/range lỗi 400, trùng slug 409.

#### `PUT /api/products/:id`

Bearer + `admin`; `id` là Mongo ObjectId. Body partial theo Product schema, validators được bật; method PUT nhưng có thể chỉ gửi field cần cập nhật. HTTP 200 trả product mới; 404 không tìm thấy; 400 ID/schema; 409 duplicate.

#### `DELETE /api/products/:id`

Bearer + `admin`; `id` là ObjectId. Không cần body. HTTP 200 data `{ "_id": "..." }`; xóa document cứng, 404 nếu không có.

### 4.4 Media management

#### `POST /api/media/presigned-url` và `POST /api/media/upload`

Với folder `landing`, `products`, hoặc `materials`, cần Bearer và role `staff`/`admin`. Request/response fields xem mục 3.8.

#### `DELETE /api/media`

Bearer + `staff`/`admin`. Có thể truyền `key` hoặc `url` bằng query hoặc JSON body; body ưu tiên query, và nếu có cả hai thì logic xóa ưu tiên `key`.

- `key`: dạng `products/<filename>`.
- `url`: backend nhận URL local `/uploads/<folder>/...` hoặc URL chứa `amazonaws.com/<folder>/...`.
- Folder phải thuộc allowlist; cần cung cấp ít nhất một giá trị phân giải được.

HTTP 200 trả `{deleted: true, key, storageMode}`. Lỗi `MISSING_MEDIA_KEY` hoặc `INVALID_MEDIA_FOLDER` 400.

### 4.5 Order CMS operations hiện chưa có role gate

Các endpoint dưới đây hiện triển khai dưới `optionalAuth` và vì vậy **không được bảo vệ bởi role staff/admin**. Chúng thường là thao tác CMS, nhưng backend hiện cho guest/customer gọi trực tiếp. Tài liệu ghi riêng để frontend/admin không hiểu nhầm.

#### `GET /api/orders`

Query: `status` (status exact hoặc `all` để bỏ lọc), `isCustom=true` (đơn có custom item), `search` (orderCode/tên khách/phone, regex không phân biệt hoa thường), `page` (default 1, min 1), `limit` (default 50, clamp 1–100), `lang`. HTTP 200 trả Order[] và `meta: {page, limit, total, totalPages}`. Không lọc đơn theo user/token.

#### `GET /api/orders/:id`

Param `id` nhận ObjectId hoặc orderCode. Body không có. Với chuỗi 24 ký tự hex, thử `_id` hoặc `orderCode`; trường hợp khác tìm orderCode uppercase. HTTP 200 trả đầy đủ order; 404 `ORDER_NOT_FOUND`.

#### `PATCH /api/orders/:id/status`

Body bắt buộc `status`; `note` tùy chọn. Param nhận ObjectId/orderCode. Status enum: `pending`, `confirmed`, `in_crafting`, `quality_check`, `shipping`, `delivered`, `cancelled`.

Transition được phép:

| Trạng thái hiện tại | Trạng thái kế tiếp |
|---|---|
| `pending` | `confirmed`, `in_crafting`, `cancelled` |
| `confirmed` | `in_crafting`, `cancelled` |
| `in_crafting` | `quality_check` |
| `quality_check` | `shipping`, `in_crafting` |
| `shipping` | `delivered` |
| `delivered` | Không có |
| `cancelled` | Không có |

Hủy từ `pending`/`confirmed` hoàn tồn kho và lưu cancelReason. Chuyển COD sang `delivered` tự đặt paymentStatus thành `paid`. Nếu status giống trạng thái hiện tại, trả order hiện tại mà không thêm lịch sử mới. HTTP 200 trả order; lỗi thiếu status/transition không hợp lệ/hủy sai trạng thái trả 400; không thấy đơn 404.

#### `PATCH /api/orders/:id/payment`

Body bắt buộc `paymentStatus` thuộc `unpaid`, `paid`, `refunded`; `note` tùy chọn. Param phải là Mongo ObjectId vì controller dùng `findById` (không hỗ trợ orderCode). Mỗi lần cập nhật thêm entry vào `statusHistory`. HTTP 200 trả Order; lỗi payment status/ID 400, không thấy đơn 404.

**Lưu ý:** các response order chứa thông tin cá nhân người nhận, lịch sử xử lý và dữ liệu thanh toán. Không xem `optionalAuth` là kiểm soát truy cập.

## 5. Static media

`GET`/`HEAD /uploads/<folder>/<key>` được Express static phục vụ từ thư mục local uploads. Không phải JSON API, không nằm dưới `/api` nên không chịu global API rate limiter; public read, không cần token. Ví dụ `/uploads/products/image.jpg`. S3 URL được trả trực tiếp từ response upload/presign và không đi qua Express static.

## 6. Enum và quy ước frontend

- Product category: `basket | bag | wallet | apparel | bracelet | accessory`.
- Material type: `shell | snail | charm | bead | cord`.
- Order status: `pending | confirmed | in_crafting | quality_check | shipping | delivered | cancelled`.
- Payment method: `cod | vietqr`.
- Payment status: `unpaid | paid | refunded`.
- Product mesh preset: `tote_bag | storage_basket | zip_wallet | eco_shirt | woven_bracelet | shell_charm_set`.
- Material mesh preset: `scallop_shell | cockle_shell | cowrie_shell | spiral_snail | turban_snail | horn_snail | starfish_charm | seahorse_charm | turtle_charm | anchor_charm | pearl_bead | sea_glass_bead | wood_bead | fishing_cord_knot`.
- Product/material list endpoint public mặc định chỉ trả `isActive=true`, nhưng `includeInactive=true` bỏ lọc.
- Frontend nên lấy giá, tồn kho, BOM, QR và upload URL từ response backend; các giá trị này được tính/cấu hình ở server.

## 7. Source map

- Mount và middleware dùng chung: `backend/src/app.js`.
- Route definitions: `backend/src/routes/*.routes.js`.
- Controller: `backend/src/controllers/*.controller.js`.
- Pricing/order business logic: `backend/src/services/pricing.service.js`, `backend/src/services/order.service.js`.
- Schema/enum/defaults: `backend/src/models/*.js`.
- Auth, rate limit, error response: `backend/src/middlewares/*.js`, `backend/src/utils/apiResponse.js`.
- Media storage: `backend/src/services/s3.service.js`, `backend/src/config/assets.js`.
