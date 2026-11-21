# Tài liệu API Backend

Tài liệu này phản ánh implementation hiện tại, để Frontend tích hợp/nâng cấp. Đã đối chiếu toàn bộ route mount: 33 endpoint dưới /api, cùng static /uploads/*.

## Quy ước chung

- Base path: /api. JSON dùng Content-Type: application/json; upload file dùng multipart/form-data.
- JSON và URL-encoded body parser giới hạn 5 MB. Sanitizer bỏ key bắt đầu bằng $ hoặc chứa dấu chấm trong body/query/params.
- Success envelope: {success:true,message,data[,meta]}. Error envelope: {success:false,message,error:{code,details}}. Rate limit có thể không có details.
- Ngôn ngữ: ?lang=en hoặc Accept-Language: en; query lang ưu tiên. Giá trị khác mặc định tiếng Việt.
- Bearer JWT ở Authorization: Bearer <token>. Middleware bắt buộc trả 401 khi token thiếu/sai/hết hạn. optionalAuth bỏ qua token thiếu/sai/hết hạn/inactive và tiếp tục như khách.
- Rate limit toàn API: 1.500 request/IP/15 phút; register/login thêm 200/IP/15 phút.
- ID MongoDB sai định dạng thường trả 400 INVALID_ID.
- Auth/role bên dưới theo middleware chạy thực tế. Materials mutation và order list/detail/status/payment chỉ có optionalAuth nên hiện không giới hạn guest/role, dù comment route order nói CMS staff/admin.

## Danh mục endpoint

| # | Method | Path | Auth |
|--:|---|---|---|
|1|GET|/api/health|Public|
|2|GET|/api/ping|Public, alias health|
|3|POST|/api/auth/register|Public|
|4|POST|/api/auth/login|Public|
|5|GET|/api/auth/me|Bearer|
|6|GET|/api/content/landing|Public|
|7|PUT|/api/content/landing|admin/staff|
|8|GET|/api/products|Public|
|9|GET|/api/products/:slug|Public|
|10|POST|/api/products|admin|
|11|PUT|/api/products/:id|admin|
|12|DELETE|/api/products/:id|admin|
|13|GET|/api/materials|Public|
|14|POST|/api/materials|optionalAuth only|
|15|PUT|/api/materials/:id|optionalAuth only|
|16|DELETE|/api/materials/:id|optionalAuth only|
|17|POST|/api/custom-designs/calculate-price|Public|
|18|POST|/api/custom-designs|optionalAuth|
|19|GET|/api/custom-designs/:idOrShareCode|Public|
|20|POST|/api/orders|optionalAuth|
|21|GET|/api/orders/lookup/:orderCode|Public|
|22|POST|/api/orders/:orderCode/cancel|optionalAuth|
|23|GET|/api/orders|optionalAuth only|
|24|GET|/api/orders/:id|optionalAuth only|
|25|PATCH|/api/orders/:id/status|optionalAuth only|
|26|PATCH|/api/orders/:id/payment|optionalAuth only|
|27|GET|/api/admin/dashboard|staff/admin|
|28|GET|/api/admin/landing|staff/admin|
|29|PUT|/api/admin/landing|staff/admin|
|30|GET|/api/media/status|Public|
|31|POST|/api/media/presigned-url|Folder-based|
|32|POST|/api/media/upload|Folder-based|
|33|DELETE|/api/media|staff/admin|

## Health

### GET /api/health và GET /api/ping
Cùng handler, public. Path/body không có; query lang tùy chọn. 200 data: status, awakeStatus, uptime, intervalMinutes, keepAlive, timestamp, environment. 429 rate limit.
- Request: GET /api/health hoặc /api/ping.
- Response mẫu: {"success":true,"message":"...","data":{"status":"ok","awakeStatus":"awake","uptime":120,"intervalMinutes":8,"keepAlive":{},"timestamp":"2026-11-15T00:00:00.000Z","environment":"production"}}.

## Authentication

### POST /api/auth/register
Public; thêm auth rate limit. Body: fullName string required/trim; email string required, trim/lowercase/unique (không có email-format validator riêng); password string required, tối thiểu 6 ký tự; phone string tùy chọn, mặc định rỗng. Không path; query lang tùy chọn.
- 201 trả token và user role customer. Lỗi: 400 MISSING_FIELDS/VALIDATION_ERROR; 409 EMAIL_EXISTS/DUPLICATE_KEY; 429 rate limit.
- Request: {"fullName":"Khách thử nghiệm","email":"demo@example.test","password":"sample-pass-123","phone":"0000000000"}.
- Response: {"success":true,"message":"...","data":{"token":"<jwt>","user":{"_id":"64b000000000000000000001","fullName":"Khách thử nghiệm","email":"demo@example.test","phone":"0000000000","role":"customer"}}}.

### POST /api/auth/login
Public; thêm auth rate limit. Body required strings email/password; email được trim/lowercase trước lookup. 200 data token + user gồm _id, fullName, email, phone, role, address. Lỗi: 400 MISSING_CREDENTIALS; 401 INVALID_CREDENTIALS; 403 USER_LOCKED; 429 rate limit.
- Request: {"email":"demo@example.test","password":"sample-pass-123"}.
- Response: {"success":true,"message":"...","data":{"token":"<jwt>","user":{"_id":"64b000000000000000000001","fullName":"Khách thử nghiệm","email":"demo@example.test","role":"customer","address":{}}}}.

### GET /api/auth/me
Bearer bắt buộc; path/body không có; query lang tùy chọn. 200 trả user lean, password không được chọn; fields thường gồm _id, fullName, email, phone, role, avatar, address, isActive, timestamps. Lỗi 401 UNAUTHORIZED/USER_INACTIVE/INVALID_TOKEN/TOKEN_EXPIRED.
- Request: GET /api/auth/me với Bearer.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000001","fullName":"Khách thử nghiệm","email":"demo@example.test","role":"customer","isActive":true}}.

## Landing content

Body PUT landing là partial JSON; nested object được merge nông, array cập nhật khi giá trị là array. Các field schema hỗ trợ:
- hero: object string badgeText,title,subtitle,primaryCtaText,primaryCtaLink,secondaryCtaText,secondaryCtaLink,heroImage,secondaryImageUrl,tertiaryImageUrl.
- heroBanner: object string backgroundImageUrl,secondaryImageUrl,tertiaryImageUrl. Image fields trong hero/heroBanner đồng bộ qua lại.
- impactStats: object number ghostNetsCollectedKg,marineLifeProtected,upcycledProductsCreated,localArtisansSupported.
- processSteps và recyclingSteps: array object {stepNumber:number,title:string,description:string,iconName:string,metricLabel:string,imageUrl:string}. Nếu chỉ gửi một array, controller copy sang field còn lại.
- galleryImages: string[].
- studioHighlight: {headline:string,description:string,features:string[]}.
- artisanStory: string name,role,village,quote,avatarUrl,workshopImageUrl.
- artisanStories: array {name,role,village,quote,avatar:string,yearsOfCraft:number}.
- seo: {metaTitle:string,metaDescription:string}.
Không có required/range rules riêng ngoài schema/default; field lạ theo Mongoose strict schema mặc định bị bỏ qua.

### GET /api/content/landing
Public; path/body không có; query lang. 200 data landing document + featuredProducts (tối đa 6), featuredMaterials (tối đa 12), liveEcoMetrics{additionalNetRecycledGrams,totalOrdersPlaced}. Nếu chưa có document, handler tạo một document trước.
- Request: GET /api/content/landing.
- Response: {"success":true,"message":"...","data":{"key":"main_landing","hero":{},"featuredProducts":[],"featuredMaterials":[],"liveEcoMetrics":{"additionalNetRecycledGrams":0,"totalOrdersPlaced":0}}}.

### PUT /api/content/landing
Bearer + role admin hoặc staff; body theo mục Body PUT landing; 200 trả document đã lưu. Lỗi 401/403/400 VALIDATION_ERROR.
- Request: {"hero":{"title":"Tiêu đề mới"},"impactStats":{"marineLifeProtected":16000}}.
- Response: {"success":true,"message":"...","data":{"key":"main_landing","hero":{"title":"Tiêu đề mới"},"impactStats":{"marineLifeProtected":16000}}}.

## Products

Body schema cho POST và partial PUT:
| Field | Type, required/default/rule |
|---|---|
|name|string; POST required, trim|
|slug|string unique/lowercase/trim; create auto-generates from name + time suffix if missing|
|sku,shortDescription,description,thumbnail|string, defaults empty|
|category|required enum basket,bag,wallet,apparel,bracelet,accessory|
|basePrice|required number >=0; craftFee number >=0 default 0; stock number >=0 default 20|
|images|string[] default []|
|isCustomizable,isFeatured,isActive|boolean defaults true/false/true|
|availableColors,availableStrapColors|array {name:string,hex:string}, each name/hex required; defaults from theme|
|availableSizes|string[] default ["Tiêu chuẩn"]|
|model3D|object: meshPreset enum tote_bag,storage_basket,zip_wallet,eco_shirt,woven_bracelet,shell_charm_set; glbUrl/defaultBaseColor/defaultStrapColor strings; roughness/metalness numbers|
|ecoImpact|object: netWeightGrams/recycledPlasticRatio/co2SavedGrams numbers; oceanOrigin/artisanGroup strings|
|soldCount,rating|numbers defaults 0 and 4.9|

### GET /api/products
Public. Query: category exact (all disables filter); isCustomizable filters only literal true/false; isFeatured=true filters featured; includeInactive=true disables active filter (still public); search matches name/shortDescription/description/slug case-insensitively; minPrice/maxPrice numeric; sort newest default, price_asc/price_desc/popular; page default 1 min 1; limit default 50 clamp 1–100; lang. No path/body.
- 200 data product[] and meta page/limit/total/totalPages.
- Request: GET /api/products?category=bracelet&page=1&limit=20&sort=popular.
- Response: {"success":true,"message":"...","data":[],"meta":{"page":1,"limit":20,"total":0,"totalPages":1}}.

### GET /api/products/:slug
Public; slug is slug or ObjectId (24 hex); if ObjectId searches _id or slug. Body none; query lang.
- 200 data product + relatedProducts (up to 4 active products in same category); 404 PRODUCT_NOT_FOUND; invalid ObjectId may produce 400 INVALID_ID.
- Request: GET /api/products/vong-tay-bien.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000002","name":"Vòng tay thử nghiệm","slug":"vong-tay-bien","relatedProducts":[]}}.

### POST /api/products
Bearer + admin. Body product schema above; required name/category/basePrice (stock defaults). 201 product. Errors 400 MISSING_NAME/VALIDATION_ERROR; 409 DUPLICATE_KEY; 401/403.
- Request: {"name":"Vòng tay thử nghiệm","category":"bracelet","basePrice":120000}.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000002","name":"Vòng tay thử nghiệm","slug":"vong-tay-thu-nghiem-1234","category":"bracelet","basePrice":120000,"stock":20}}.

### PUT /api/products/:id
Bearer + admin; path id ObjectId; body partial product schema; validators enabled. 200 updated product. Errors 404 PRODUCT_NOT_FOUND; 400 INVALID_ID/VALIDATION_ERROR; 409 DUPLICATE_KEY; 401/403.
- Request: PUT /api/products/64b000000000000000000002 with body {"basePrice":125000}.
- Response data includes product with basePrice 125000.

### DELETE /api/products/:id
Bearer + admin; path id ObjectId; query/body none. 200 data {_id}; deletes document. Errors 404 PRODUCT_NOT_FOUND, 400 INVALID_ID, 401/403.
- Request: DELETE /api/products/64b000000000000000000002.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000002"}}.

## Materials

Body schema for POST and partial PUT:
|Field|Type, required/default/rules|
|---|---|
|name|required string, trim|
|code|required unique uppercase string; POST generates MAT-xxxxx if absent and name is present|
|materialType|required enum shell,snail,charm,bead,cord|
|unitPrice|required number >=0|
|description,thumbnail,defaultColor,origin|strings; schema/theme defaults|
|stockQuantity,lowStockThreshold|numbers default 100/10; stock min 0|
|colorPalette|string[] default theme|
|model3D|meshPreset enum scallop_shell,cockle_shell,cowrie_shell,spiral_snail,turban_snail,horn_snail,starfish_charm,seahorse_charm,turtle_charm,anchor_charm,pearl_bead,sea_glass_bead,wood_bead,fishing_cord_knot; glbUrl string; defaultScale/roughness/metalness numbers|
|isActive|boolean default true|

### GET /api/materials
Public. Query materialType exact (all disables filter), includeInactive=true disables active filter, search in name/code/description, lang. No path/body.
- 200 data sorted by materialType/unitPrice, meta total.
- Request: GET /api/materials?materialType=shell.
- Response: {"success":true,"message":"...","data":[],"meta":{"total":0}}.

### POST /api/materials
Auth only optionalAuth; guest/every role continues. verifyToken/requireRole are imported but not attached to route.
- Body material schema; name/materialType/unitPrice required. 201 material. Errors 400 VALIDATION_ERROR, 409 DUPLICATE_KEY; no role-based 401/403.
- Request: {"name":"Vỏ sò thử nghiệm","materialType":"shell","unitPrice":15000}.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000003","name":"Vỏ sò thử nghiệm","code":"MAT-12345","materialType":"shell","unitPrice":15000,"stockQuantity":100}}.

### PUT /api/materials/:id
optionalAuth only; path id ObjectId; partial material body, validators enabled. 200 updated material. Errors 404 MATERIAL_NOT_FOUND; 400 INVALID_ID/VALIDATION_ERROR; 409 DUPLICATE_KEY.
- Request: PUT /api/materials/64b000000000000000000003 with body {"unitPrice":16000}.
- Response: success data has updated unitPrice.

### DELETE /api/materials/:id
optionalAuth only; path id ObjectId; query/body none. 200 data {_id}. Errors 404 MATERIAL_NOT_FOUND, 400 INVALID_ID.
- Request: DELETE /api/materials/64b000000000000000000003.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000003"}}.

## Custom designs

Each placements[] item: materialId ObjectId required; position number[3] default [0,0,0]; normal number[3] default [0,0,1] and normalized; scale number default 1, range 0.4–2.5; rotation number default 0 (invalid numeric becomes 0); slotIndex number or null; placementId optional string, generated if missing; color string default empty; isDanglingCharm boolean by truthiness. Max 50 placements; material must exist and be active.

### POST /api/custom-designs/calculate-price
Public. Body productId ObjectId required; placements array optional default []. 200 data productId/productName, pricingBreakdown{basePrice,craftFee,materialsTotal,estimatedPrice}, bomSummary, placementsCount.
- Errors 400 missing product/invalid placements/material/position/normal/scale/max; 404 PRODUCT_NOT_FOUND.
- Request: {"productId":"64b000000000000000000002","placements":[{"materialId":"64b000000000000000000003","position":[0,0.2,0],"normal":[0,0,1],"scale":1}]}.
- Response: {"success":true,"message":"...","data":{"productId":"64b000000000000000000002","productName":"Vòng tay thử nghiệm","pricingBreakdown":{"basePrice":120000,"craftFee":0,"materialsTotal":15000,"estimatedPrice":135000},"bomSummary":[],"placementsCount":1}}.

### POST /api/custom-designs
optionalAuth; valid user attaches userId. Body productId required; placements optional default []; strings name/baseColor/strapColor/size/note/previewThumbnail optional; braceletConfig optional object: wristSizeCm default 16 clamp 12–25; slotCount default 12, rounded/clamp 4–30; cordMaterial default recycled_net_cord. Price recalculated from DB.
- 201 saved design with server-generated shareCode and populated product. Errors as calculate-price and schema validation.
- Request: {"productId":"64b000000000000000000002","name":"Thiết kế thử nghiệm","placements":[]}.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000004","shareCode":"3D-ABC234","name":"Thiết kế thử nghiệm","productId":{"name":"Vòng tay thử nghiệm"},"placements":[],"pricingBreakdown":{"basePrice":120000,"craftFee":0,"materialsTotal":0,"estimatedPrice":120000}}.

### GET /api/custom-designs/:idOrShareCode
Public; path accepts ObjectId 24 hex or shareCode (uppercased); body none. 200 design + populated product; 404 DESIGN_NOT_FOUND.
- Request: GET /api/custom-designs/3D-ABC234.
- Response: {"success":true,"message":"...","data":{"shareCode":"3D-ABC234","placements":[],"productId":{"name":"Vòng tay thử nghiệm"}}}.

## Orders

### POST /api/orders
optionalAuth; guest allowed; valid user attaches userId.
- Body customerInfo object required: required strings fullName/phone/address; optional strings email/note; city default Đà Nẵng.
- items required nonempty array. Each item: productId ObjectId or customDesignId ObjectId (product may be inferred from saved design); quantity default 1 via parseInt, minimum 1; optional strings selectedColor/selectedStrapColor/selectedSize.
- Custom item if isCustom true, customDesignId/customDesign/customDesignSnapshot present, or placements nonempty. Placements item-level or in inline design object; braceletConfig and inline baseColor/strapColor/size/note/artisanNote/name/shareCode can be copied into saved snapshot.
- paymentMethod exact vietqr selects VietQR; other values normalize to cod. Client price/BOM ignored; server recalculates. 5 MB parser.
- 201 order; shipping fee 0 for subtotal >= 500000, otherwise 30000. Errors 400 invalid customer/items/quantity/product/stock/material/concurrent stock; 404 missing saved design.
- Request: {"customerInfo":{"fullName":"Khách thử nghiệm","phone":"0000000000","address":"Địa chỉ thử nghiệm","email":"demo@example.test"},"items":[{"productId":"64b000000000000000000002","quantity":1}],"paymentMethod":"cod"}.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000005","orderCode":"DTU-20261115-ABCD","status":"pending","paymentMethod":"cod","subtotal":120000,"shippingFee":30000,"totalAmount":150000,"items":[]}}.

### GET /api/orders/lookup/:orderCode
Public. Path orderCode string trimmed/uppercased. Query phone optional; if sent must exactly match customer phone or 403. Body none. 200 full order; 404 ORDER_NOT_FOUND.
- Request: GET /api/orders/lookup/DTU-20261115-ABCD?phone=0000000000.
- Response: {"success":true,"message":"...","data":{"orderCode":"DTU-20261115-ABCD","customerInfo":{},"items":[],"status":"pending"}}.

### POST /api/orders/:orderCode/cancel
optionalAuth only. Path orderCode or ObjectId. Body reason/phone optional strings; if phone sent it must match. Code does not require phone or login. 200 cancelled; pending/confirmed cancellation restores stock. Errors 404 order, 403 phone mismatch, 400 non-cancellable state (in_crafting/quality_check/shipping/delivered).
- Request: {"reason":"Khách yêu cầu hủy","phone":"0000000000"}.
- Response: {"success":true,"message":"...","data":{"orderCode":"DTU-20261115-ABCD","status":"cancelled"}}.

### GET /api/orders
optionalAuth only; no role or ownership restriction (guest currently can read list).
- Query status exact (all disables filter); isCustom=true filters custom items; search in orderCode/customer name/phone; page default 1 min 1; limit default 50 clamp 1–100; lang. No path/body.
- 200 order[] and meta page/limit/total/totalPages.
- Request: GET /api/orders?status=pending&page=1&limit=20.
- Response: {"success":true,"message":"...","data":[],"meta":{"page":1,"limit":20,"total":0,"totalPages":1}}.

### GET /api/orders/:id
optionalAuth only; no owner filter. Path id ObjectId or orderCode; body none; query lang. 200 full order; 404 ORDER_NOT_FOUND; possible 400 INVALID_ID.
- Request: GET /api/orders/64b000000000000000000005.
- Response: {"success":true,"message":"...","data":{"orderCode":"DTU-20261115-ABCD","customerInfo":{},"items":[],"status":"pending","paymentStatus":"unpaid"}}.

### PATCH /api/orders/:id/status
optionalAuth only despite CMS comment; no role gate. Path accepts ObjectId/orderCode. Body status required string enum pending/confirmed/in_crafting/quality_check/shipping/delivered/cancelled; note optional string.
- Transitions: pending→confirmed/in_crafting/cancelled; confirmed→in_crafting/cancelled; in_crafting→quality_check; quality_check→shipping/in_crafting; shipping→delivered. delivered/cancelled terminal. Cancellation is blocked from in_crafting, quality_check, shipping, delivered.
- 200 updated order; delivered COD becomes paid; cancel pending/confirmed restores stock. Errors 400 MISSING_STATUS/INVALID_STATUS_TRANSITION/CANNOT_CANCEL_IN_CRAFTING/ALREADY_CANCELLED; 404 ORDER_NOT_FOUND.
- Request: {"status":"confirmed","note":"Đã xác nhận"}.
- Response: {"success":true,"message":"...","data":{"orderCode":"DTU-20261115-ABCD","status":"confirmed"}}.

### PATCH /api/orders/:id/payment
optionalAuth only. Path must be ObjectId (controller uses findById, unlike status). Body paymentStatus required by behavior; enum unpaid/paid/refunded; note optional string. 200 updated order/history. Errors 400 INVALID_PAYMENT_STATUS/INVALID_ID; 404 ORDER_NOT_FOUND.
- Request: {"paymentStatus":"paid","note":"Đã đối soát"}.
- Response: {"success":true,"message":"...","data":{"_id":"64b000000000000000000005","paymentStatus":"paid"}}.

## Admin

### GET /api/admin/dashboard
Bearer + staff/admin; path/query/body none except lang. 200 data summary, statusBreakdown, lowStockMaterials, lowStockProducts, recentOrders (max 8). 401/403.
- Request: GET /api/admin/dashboard.
- Response: {"success":true,"message":"...","data":{"summary":{"totalRevenue":0,"totalOrders":0,"totalProducts":0},"statusBreakdown":{},"lowStockMaterials":[],"lowStockProducts":[],"recentOrders":[]}}.

### GET /api/admin/landing
Bearer + staff/admin. Authenticated alias of GET /api/content/landing; same params/data (including computed products, materials, metrics), plus 401/403. Response sample same as content GET.

### PUT /api/admin/landing
Bearer + staff/admin. Alias of PUT /api/content/landing; same partial body, response, errors.

## Media

Allowed folders: landing/products/materials/custom-previews. Allowed MIME: image/jpeg,image/png,image/webp,image/gif,image/avif. Names are trimmed/lowercased. Upload max size comes from UPLOAD_MAX_FILE_SIZE_MB (default 5 MB).

### GET /api/media/status
Public; path/query/body none except lang. 200 data storageMode,isS3Configured,bucket,region,publicBaseUrl,folders,allowedMimeTypes,maxFileSizeMb,presignedExpiresIn.
- Request: GET /api/media/status.
- Response: {"success":true,"message":"...","data":{"storageMode":"local-fallback","isS3Configured":false,"bucket":"<configured-bucket>","region":"<configured-region>","publicBaseUrl":"<backend-url>/uploads","folders":["landing","products","materials","custom-previews"],"allowedMimeTypes":["image/jpeg","image/png","image/webp","image/gif","image/avif"],"maxFileSizeMb":5,"presignedExpiresIn":300}}.

### POST /api/media/presigned-url
Folder-aware authorization uses body.folder || query.folder || products. custom-previews permits guest/optionalAuth; other folders require Bearer + staff/admin.
- JSON body: folder string default products; fileName string default upload.jpg; mimeType string default image/jpeg; contentType fallback only if mimeType is falsy. Mime/folder must be allowlisted.
- Query folder affects auth only; handler uses body folder then defaults to products. Send folder in body. Query-only custom-previews can pass guest auth while operation targets products.
- 200 data storageMode,uploadMethod,uploadUrl,publicUrl,key,folder,contentType,expiresIn. S3 uses PUT; local fallback uses POST_MULTIPART. Errors 400 invalid folder/MIME, 401/403.
- Request: {"folder":"custom-previews","fileName":"preview.png","mimeType":"image/png"}.
- Response: {"success":true,"message":"...","data":{"storageMode":"local-fallback","uploadMethod":"POST_MULTIPART","uploadUrl":"<backend-url>/api/media/upload","publicUrl":"<backend-url>/uploads/custom-previews/<key>.png","key":"custom-previews/<key>.png","folder":"custom-previews","contentType":"image/png","expiresIn":300}}.

### POST /api/media/upload
Multer single field file, size limit from env; Multer runs before folder authorization. Folder auth same as presigned.
- Multipart form: file field file; optional folder. File required unless base64 is sent.
- JSON alternative: base64Data required if no file (base64 or data URL); fileName default upload.png; mimeType default image/png; folder optional. Decoded buffer must be nonempty. JSON parser also has 5 MB limit.
- Effective folder body, then query, then products.
- 201 data storageMode,bucket,region,key,folder,mimeType,size,url,publicUrl. Errors 400 MISSING_FILE/FILE_TOO_LARGE/UPLOAD_ERROR/INVALID_MEDIA_FOLDER/INVALID_MEDIA_MIME_TYPE; 401/403.
- Request JSON: {"folder":"custom-previews","fileName":"preview.png","mimeType":"image/png","base64Data":"<base64-image-bytes>"}.
- Response: {"success":true,"message":"...","data":{"storageMode":"local-fallback","key":"custom-previews/<key>.png","folder":"custom-previews","mimeType":"image/png","size":12345,"url":"<backend-url>/uploads/custom-previews/<key>.png","publicUrl":"<backend-url>/uploads/custom-previews/<key>.png"}}.

### DELETE /api/media
Bearer + staff/admin. Body/query key and/or url strings; body takes precedence over query, key over URL. URL resolver supports local /uploads/<allowed-folder>/<path> or amazonaws.com/<folder>/<path>. At least one must resolve, folder allowlisted.
- 200 data {deleted:true,key,storageMode}; errors 400 MISSING_MEDIA_KEY/INVALID_MEDIA_FOLDER; 401/403.
- Request: {"key":"products/<key>.jpg"}.
- Response: {"success":true,"message":"...","data":{"deleted":true,"key":"products/<key>.jpg","storageMode":"local-fallback"}}.

## Static media /uploads/*

Express static, not JSON API; outside /api/rate limiter. Public GET/HEAD under local backend/uploads, e.g. /uploads/products/<key>.jpg. No auth, query/body, route-specific params or JSON envelope; missing media is a static 404. Local fallback URL: <BACKEND_PUBLIC_URL>/uploads/<key>. S3 upload returns external publicUrl. Read is public; upload/delete authorization is enforced only by media APIs.

## Lỗi dùng chung

|HTTP|Codes|Meaning|
|---:|---|---|
|400|VALIDATION_ERROR, INVALID_ID|Mongoose validation / invalid ObjectId; validation details are messages|
|401|UNAUTHORIZED, INVALID_TOKEN, TOKEN_EXPIRED, USER_INACTIVE|Auth required/invalid|
|403|FORBIDDEN, PHONE_MISMATCH|Role denial/phone mismatch|
|404|NOT_FOUND, PRODUCT_NOT_FOUND, MATERIAL_NOT_FOUND, ORDER_NOT_FOUND, DESIGN_NOT_FOUND|Route/resource missing|
|409|DUPLICATE_KEY|Unique value conflict|
|429|TOO_MANY_REQUESTS, AUTH_RATE_LIMIT|Rate limit|
|500|INTERNAL_SERVER_ERROR|Unmapped server error|

Error example: {"success":false,"message":"Không tìm thấy sản phẩm","error":{"code":"PRODUCT_NOT_FOUND","details":null}}.

## Source map

src/app.js; src/routes/*.routes.js; src/controllers/*.controller.js; src/services/*.service.js; src/middlewares/*.middleware.js; src/models/*.js; src/config/assets.js; src/i18n/messages.js.

