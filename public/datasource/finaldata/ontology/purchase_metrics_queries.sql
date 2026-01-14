-- ============================================
-- 采购面板指标SQL查询集合
-- ============================================
-- 说明：以下SQL查询用于计算采购面板中的各项指标
-- 数据表：
--   - purchase_order_event.csv: 采购订单事件表
--   - material_procurement_event.csv: 物料采购事件表
-- ============================================

-- ============================================
-- 1. 计划采购总量（本月）
-- ============================================
-- 计算当前月份的计划采购总量
-- 假设当前月份为 2024-12（可根据实际需要修改）
SELECT 
    SUM(purchase_quantity) AS planned_purchase_total,
    COUNT(DISTINCT purchase_order_id) AS order_count,
    COUNT(DISTINCT material_id) AS material_count
FROM purchase_order_event
WHERE 
    strftime('%Y-%m', document_date) = strftime('%Y-%m', 'now')
    -- 或者指定具体月份，例如：strftime('%Y-%m', document_date) = '2024-12'
    AND status = 'Active';

-- ============================================
-- 2. 已采购量（执行率）
-- ============================================
-- 计算本月已完成的采购数量（状态为"已验收"）
SELECT 
    SUM(quantity) AS purchased_quantity,
    COUNT(DISTINCT procurement_id) AS procurement_count
FROM material_procurement_event
WHERE 
    strftime('%Y-%m', procurement_date) = strftime('%Y-%m', 'now')
    AND inspection_status = '已验收'
    AND status = 'Active';

-- ============================================
-- 3. 执行率计算（已采购量 / 计划采购总量）
-- ============================================
WITH planned_total AS (
    SELECT 
        COALESCE(SUM(purchase_quantity), 0) AS total_planned
    FROM purchase_order_event
    WHERE 
        strftime('%Y-%m', document_date) = strftime('%Y-%m', 'now')
        AND status = 'Active'
),
purchased_total AS (
    SELECT 
        COALESCE(SUM(quantity), 0) AS total_purchased
    FROM material_procurement_event
    WHERE 
        strftime('%Y-%m', procurement_date) = strftime('%Y-%m', 'now')
        AND inspection_status = '已验收'
        AND status = 'Active'
)
SELECT 
    pt.total_planned AS planned_purchase_total,
    pu.total_purchased AS purchased_quantity,
    CASE 
        WHEN pt.total_planned > 0 
        THEN ROUND((pu.total_purchased * 100.0 / pt.total_planned), 2)
        ELSE 0 
    END AS execution_rate_percent
FROM planned_total pt
CROSS JOIN purchased_total pu;

-- ============================================
-- 4. 在途采购量
-- ============================================
-- 计算状态为"验收中"或"待验收"的采购数量
SELECT 
    SUM(quantity) AS in_transit_quantity,
    COUNT(DISTINCT procurement_id) AS in_transit_count,
    inspection_status,
    COUNT(*) AS status_count
FROM material_procurement_event
WHERE 
    inspection_status IN ('验收中', '待验收')
    AND status = 'Active'
GROUP BY inspection_status;

-- 汇总在途采购量（所有在途状态）
SELECT 
    SUM(quantity) AS total_in_transit_quantity,
    COUNT(DISTINCT procurement_id) AS total_in_transit_count
FROM material_procurement_event
WHERE 
    inspection_status IN ('验收中', '待验收')
    AND status = 'Active';

-- ============================================
-- 5. 本月计划采购量前5的物料
-- ============================================
SELECT 
    material_id,
    material_code,
    material_name,
    SUM(purchase_quantity) AS total_planned_quantity,
    COUNT(DISTINCT purchase_order_id) AS order_count,
    SUM(total_amount_tax) AS total_amount
FROM purchase_order_event
WHERE 
    strftime('%Y-%m', document_date) = strftime('%Y-%m', 'now')
    AND status = 'Active'
GROUP BY 
    material_id, material_code, material_name
ORDER BY 
    total_planned_quantity DESC
LIMIT 5;

-- ============================================
-- 6. 采购优化及调整建议（基于执行率）
-- ============================================
WITH monthly_stats AS (
    SELECT 
        strftime('%Y-%m', po.document_date) AS month,
        COALESCE(SUM(po.purchase_quantity), 0) AS planned_qty,
        COALESCE(SUM(CASE WHEN pr.inspection_status = '已验收' THEN pr.quantity ELSE 0 END), 0) AS completed_qty,
        COALESCE(SUM(CASE WHEN pr.inspection_status IN ('验收中', '待验收') THEN pr.quantity ELSE 0 END), 0) AS in_transit_qty
    FROM purchase_order_event po
    LEFT JOIN material_procurement_event pr 
        ON po.purchase_order_number = pr.procurement_number
    WHERE 
        po.status = 'Active'
        AND (pr.status = 'Active' OR pr.status IS NULL)
    GROUP BY strftime('%Y-%m', po.document_date)
),
current_month_stats AS (
    SELECT 
        planned_qty,
        completed_qty,
        in_transit_qty,
        CASE 
            WHEN planned_qty > 0 
            THEN ROUND((completed_qty * 100.0 / planned_qty), 2)
            ELSE 0 
        END AS execution_rate
    FROM monthly_stats
    WHERE month = strftime('%Y-%m', 'now')
)
SELECT 
    planned_qty AS planned_purchase_total,
    completed_qty AS purchased_quantity,
    in_transit_qty AS in_transit_quantity,
    execution_rate,
    CASE 
        WHEN execution_rate < 50 THEN '执行率偏低，建议加快采购进度'
        WHEN execution_rate < 80 THEN '执行率中等，建议关注在途订单'
        WHEN execution_rate >= 80 THEN '执行率良好，保持当前节奏'
        ELSE '暂无数据'
    END AS optimization_suggestion
FROM current_month_stats;

-- ============================================
-- 7. 综合查询：获取所有采购面板指标
-- ============================================
-- 一次性获取所有需要的指标数据
WITH current_month AS (
    SELECT strftime('%Y-%m', 'now') AS month
),
planned_data AS (
    SELECT 
        COALESCE(SUM(purchase_quantity), 0) AS planned_total,
        COUNT(DISTINCT purchase_order_id) AS order_count
    FROM purchase_order_event po, current_month cm
    WHERE 
        strftime('%Y-%m', po.document_date) = cm.month
        AND po.status = 'Active'
),
purchased_data AS (
    SELECT 
        COALESCE(SUM(quantity), 0) AS purchased_total
    FROM material_procurement_event pr, current_month cm
    WHERE 
        strftime('%Y-%m', pr.procurement_date) = cm.month
        AND pr.inspection_status = '已验收'
        AND pr.status = 'Active'
),
in_transit_data AS (
    SELECT 
        COALESCE(SUM(quantity), 0) AS in_transit_total
    FROM material_procurement_event pr
    WHERE 
        pr.inspection_status IN ('验收中', '待验收')
        AND pr.status = 'Active'
),
top_materials AS (
    SELECT 
        material_id,
        material_code,
        material_name,
        SUM(purchase_quantity) AS planned_qty
    FROM purchase_order_event po, current_month cm
    WHERE 
        strftime('%Y-%m', po.document_date) = cm.month
        AND po.status = 'Active'
    GROUP BY material_id, material_code, material_name
    ORDER BY planned_qty DESC
    LIMIT 5
)
SELECT 
    pd.planned_total AS planned_purchase_total,
    pu.purchased_total AS purchased_quantity,
    it.in_transit_total AS in_transit_quantity,
    CASE 
        WHEN pd.planned_total > 0 
        THEN ROUND((pu.purchased_total * 100.0 / pd.planned_total), 2)
        ELSE 0 
    END AS execution_rate_percent,
    pd.order_count,
    CASE 
        WHEN pd.planned_total > 0 AND (pu.purchased_total * 100.0 / pd.planned_total) < 50 
        THEN '执行率偏低，建议加快采购进度'
        WHEN pd.planned_total > 0 AND (pu.purchased_total * 100.0 / pd.planned_total) < 80 
        THEN '执行率中等，建议关注在途订单'
        WHEN pd.planned_total > 0 AND (pu.purchased_total * 100.0 / pd.planned_total) >= 80 
        THEN '执行率良好，保持当前节奏'
        ELSE '暂无数据'
    END AS optimization_suggestion
FROM planned_data pd
CROSS JOIN purchased_data pu
CROSS JOIN in_transit_data it;

-- ============================================
-- 8. 获取前5物料详情（JSON格式，便于前端使用）
-- ============================================
SELECT 
    json_group_array(
        json_object(
            'material_id', material_id,
            'material_code', material_code,
            'material_name', material_name,
            'planned_quantity', planned_qty,
            'rank', row_number() OVER (ORDER BY planned_qty DESC)
        )
    ) AS top_5_materials
FROM (
    SELECT 
        material_id,
        material_code,
        material_name,
        SUM(purchase_quantity) AS planned_qty
    FROM purchase_order_event
    WHERE 
        strftime('%Y-%m', document_date) = strftime('%Y-%m', 'now')
        AND status = 'Active'
    GROUP BY material_id, material_code, material_name
    ORDER BY planned_qty DESC
    LIMIT 5
);

-- ============================================
-- 使用说明：
-- ============================================
-- 1. 如果使用SQLite，日期函数使用 strftime('%Y-%m', date_column)
-- 2. 如果使用PostgreSQL，将 strftime 替换为 to_char(date_column, 'YYYY-MM')
-- 3. 如果使用MySQL，将 strftime 替换为 DATE_FORMAT(date_column, '%Y-%m')
-- 4. 当前月份可以通过修改 'now' 或使用具体日期值来指定
-- 5. 建议根据实际数据库类型调整SQL语法
-- ============================================

