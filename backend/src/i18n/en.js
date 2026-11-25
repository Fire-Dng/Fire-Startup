module.exports = {
    // General & Health
    SUCCESS: 'Success',
    ERROR_DEFAULT: 'An error occurred',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    HEALTH_OK: 'DTU Upcycled Fishing Net & 3D Ocean Craft API is healthy',
    ROUTE_NOT_FOUND: 'API route not found: {url}',
    INVALID_ID: 'Invalid ID format for field {path}: {value}',
    DUPLICATE_KEY: "Value for '{field}' already exists",
    TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later.',
    AUTH_RATE_LIMIT: 'Too many login/register attempts, please try again later.',

    // Auth & RBAC
    AUTH_REQUIRED: 'Please log in to perform this action',
    USER_INACTIVE: 'Account does not exist or has been deactivated',
    USER_LOCKED: 'Account has been locked',
    FORBIDDEN_ROLE: 'You do not have permission to access this resource (Required role: {roles})',
    INVALID_TOKEN: 'Invalid authentication token',
    TOKEN_EXPIRED: 'Session expired, please log in again',
    REGISTER_MISSING_FIELDS: 'Please provide full name, email, and password',
    EMAIL_EXISTS: 'This email is already registered',
    REGISTER_SUCCESS: 'Account registered successfully',
    LOGIN_MISSING_FIELDS: 'Please provide email and password',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_SUCCESS: 'Logged in successfully',
    GET_ME_SUCCESS: 'Fetched user profile successfully',

    // Landing Content
    GET_LANDING_SUCCESS: 'Fetched LandingPage content successfully',
    UPDATE_LANDING_SUCCESS: 'Updated LandingPage content successfully',

    // Products
    GET_PRODUCTS_SUCCESS: 'Fetched product list successfully',
    GET_PRODUCT_DETAIL_SUCCESS: 'Fetched product details successfully',
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_MISSING_NAME: 'Product name is required',
    CREATE_PRODUCT_SUCCESS: 'Created product successfully',
    UPDATE_PRODUCT_SUCCESS: 'Updated product successfully',
    DELETE_PRODUCT_SUCCESS: 'Deleted product successfully',

    // Custom Materials
    GET_MATERIALS_SUCCESS: 'Fetched custom materials successfully',
    MATERIAL_NOT_FOUND: 'Custom material not found',
    CREATE_MATERIAL_SUCCESS: 'Created custom material successfully',
    UPDATE_MATERIAL_SUCCESS: 'Updated custom material successfully',
    DELETE_MATERIAL_SUCCESS: 'Deleted custom material successfully',

    // 3D Customizer & Pricing
    CALCULATE_PRICE_SUCCESS: 'Calculated real-time BOM pricing successfully (BR-01)',
    SAVE_DESIGN_SUCCESS: 'Saved 3D custom design successfully',
    GET_DESIGN_SUCCESS: 'Fetched 3D custom design successfully',
    DESIGN_NOT_FOUND: '3D custom design not found',
    INVALID_PLACEMENTS_ARRAY: 'Placements must be an array',
    MAX_PLACEMENTS_EXCEEDED: 'Maximum 50 accessories allowed per product (current: {count}) (BR-02)',
    PLACEMENT_MISSING_MATERIAL: 'Accessory #{index} is missing materialId',
    INVALID_POSITION: 'Accessory #{index} has invalid 3D position [x, y, z] (BR-03)',
    INVALID_NORMAL: 'Accessory #{index} has invalid surface normal vector [nx, ny, nz] (BR-03)',
    INVALID_SCALE: 'Accessory #{index} has scale ({scale}) outside allowed range [0.4 - 2.5] (BR-03)',
    MISSING_PRODUCT_ID: 'Please provide productId',
    MATERIAL_INACTIVE: 'Material "{name}" is currently inactive',
    PRODUCT_NOT_CUSTOMIZABLE: 'Product "{name}" does not support 3D customization',

    // Orders & Inventory
    PLACE_ORDER_SUCCESS: 'Order placed successfully! Our artisan workshop has received your ticket.',
    LOOKUP_ORDER_SUCCESS: 'Order lookup successful',
    CANCEL_ORDER_SUCCESS: 'Order cancelled and inventory rolled back successfully (BR-06)',
    GET_ORDERS_SUCCESS: 'Fetched order list successfully',
    GET_ORDER_DETAIL_SUCCESS: 'Fetched order details successfully',
    UPDATE_ORDER_STATUS_SUCCESS: 'Updated order status to "{status}"',
    UPDATE_ORDER_PAYMENT_SUCCESS: 'Updated payment status to "{paymentStatus}"',
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_CUSTOMER_INFO: 'Please provide full recipient info (Full Name, Phone, Address)',
    EMPTY_ORDER_ITEMS: 'Order items cannot be empty',
    INVALID_QUANTITY: 'Quantity for item #{index} must be >= 1',
    PRODUCT_UNAVAILABLE: 'Product "{name}" is unavailable or discontinued',
    INSUFFICIENT_PRODUCT_STOCK:
      'Product "{name}" has insufficient stock (Required: {required}, Available: {available}) (BR-04)',
    MATERIAL_UNAVAILABLE: 'Material "{name}" is no longer active in inventory (BR-04)',
    INSUFFICIENT_MATERIAL_STOCK:
      'Material "{name}" ({code}) has insufficient stock (Required: {required}, Available: {available}) (BR-04)',
    CONCURRENT_PRODUCT_OUT_OF_STOCK: 'Product "{name}" went out of stock during checkout (Required: {required})',
    CONCURRENT_MATERIAL_OUT_OF_STOCK: 'Material "{name}" went out of stock during checkout (Required: {required})',
    PHONE_MISMATCH: 'Confirmation phone number does not match order record',
    CANNOT_CANCEL_IN_CRAFTING:
      'Cannot cancel order in status "{status}" (Workshop crafting or shipping already started - BR-05)',
    ALREADY_CANCELLED: 'This order has already been cancelled',
    INVALID_STATUS_TRANSITION: 'Invalid status transition from "{current}" to "{next}" (Allowed: {allowed}) (BR-05)',
    MISSING_STATUS: 'Please provide new status',
    INVALID_PAYMENT_STATUS: 'Invalid payment status (unpaid | paid | refunded)',

    // Admin Dashboard
    GET_DASHBOARD_SUCCESS: 'Fetched CMS Dashboard statistics successfully',

    // AWS S3 & Hybrid Media Upload
    MEDIA_STATUS_SUCCESS: 'Fetched S3 Media storage status successfully',
    MEDIA_PRESIGNED_SUCCESS: 'Generated S3 Presigned Upload URL successfully',
    MEDIA_UPLOAD_SUCCESS: 'Uploaded image successfully',
    MEDIA_DELETE_SUCCESS: 'Deleted media file successfully',
    MEDIA_MISSING_FILE: 'Please provide an image file to upload',
    MEDIA_INVALID_FOLDER: 'Invalid storage folder "{folder}" (Allowed: {allowed})',
    MEDIA_INVALID_MIME: 'Invalid file MIME type "{mimeType}". Only JPEG, PNG, WEBP, GIF, AVIF images are allowed.',
    MEDIA_FILE_TOO_LARGE: 'File size exceeds maximum limit ({maxSizeMb}MB)',
    MEDIA_MISSING_KEY: 'Please provide file key or url to delete',
};
