# MPLP Brand Asset Status (VI v1.0 Freeze Candidate)

**Status:** 🟡 Partial Ready (PNGs Ready, SVGs Pending)
**SOT Path:** `public/brand/` (To be migrated to `public/brand/assets/v1/`)

## 1. Protocol Mark Family (Core)

| Asset Name | Format | Status | Notes |
| :--- | :--- | :--- | :--- |
| `mplp-protocol-mark-3d-color` | PNG | ✅ **Ready** | Formerly `mplp-logo-primary-hd.png`. Master Render. |
| `mplp-protocol-mark-flat` | SVG | ⏳ **Pending** | Required for Print/PDF. Needs vectorization. |
| `mplp-protocol-mark-mono-white` | PNG | ✅ **Ready** | Formerly `mplp-logo-mono-white-hd.png`. |
| `mplp-protocol-mark-mono-white` | SVG | ⏳ **Pending** | Required for Docs Header. |
| `mplp-protocol-mark-mono-black` | SVG | ⏳ **Pending** | Required for Light Mode. |

## 2. Icon System

| Asset Name | Format | Status | Notes |
| :--- | :--- | :--- | :--- |
| `mplp-icon-flat` | SVG | ⏳ **Pending** | Base for icon system. |
| `mplp-icon-only-transparent` | PNG | ✅ **Ready** | Generated via flood-fill script. |
| `mplp-favicon` | PNG | ✅ **Ready** | Available in 16/32/48 sizes (derived). |

## 3. Social & Campaign (Layer 2)

| Asset Name | Format | Status | Notes |
| :--- | :--- | :--- | :--- |
| `mplp-social-cover` | PNG | ✅ **Ready** | 1600x900. Protocol Monument Template. |
| `mplp-social-square` | PNG | ⏳ **Pending** | 1024x1024 Avatar. |

## 4. Documentation

*   **VI Specification**: `VI_SPEC.md` (v1.0 Freeze Candidate) - **UPDATED**
*   **Upgrade Kit**: `docs-upgrade-kit/` - **READY**

## Next Steps
1.  **Vectorization**: Convert PNG masters to clean SVG (Flat/Mono).
2.  **Migration**: Move assets to `public/brand/assets/v1/`.
3.  **Freeze**: Lock v1.0 folder.