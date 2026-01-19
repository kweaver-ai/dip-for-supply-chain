/**
 * HD Supplier Data Loader
 * 
 * Provides HD supplier data loading from API.
 * Replaces CSV-based data loading with API calls to ontology.
 */

import { ontologyApi } from '../api';
import { loadSupplierEntities, loadSupplierPerformanceScores } from './ontologyDataService';
import type { Supplier360Scorecard } from '../types/ontology';

/**
 * Load HD supplier 360 scorecards
 * Combines supplier entities with performance scores
 */
export async function loadHDSupplier360Scorecards(): Promise<Supplier360Scorecard[]> {
    console.log('[HDSupplierDataLoader] Loading HD supplier 360 scorecards...');

    try {
        // Load supplier data and performance scores in parallel
        const [suppliers, performances] = await Promise.all([
            loadSupplierEntities(),
            loadSupplierPerformanceScores(),
        ]);

        // Combine supplier data with performance scores
        const scorecards: Supplier360Scorecard[] = performances.map(perf => {
            const supplier = suppliers.find(s => s.supplier_id === perf.supplier_id);

            return {
                supplierId: perf.supplier_id,
                supplierName: perf.supplier_name || supplier?.supplier_name || perf.supplier_id,
                evaluationDate: perf.evaluation_date,
                overallScore: parseFloat(perf.overall_score) || 85,
                dimensions: {
                    qualityRating: parseFloat(perf.quality_score) || 85,
                    onTimeDeliveryRate: parseFloat(perf.otif_rate) || 90,
                    riskRating: getRiskRatingFromLevel(perf.risk_level),
                    onTimeDeliveryRate2: parseFloat(perf.delivery_score) || 90,
                    annualPurchaseAmount: parseFloat(perf.total_orders) || 0,
                    responseSpeed: parseFloat(perf.response_time_hours) || 24,
                },
                riskAssessment: {
                    supplierId: perf.supplier_id,
                    assessmentDate: perf.evaluation_date,
                    overallRiskLevel: normalizeRiskLevel(perf.risk_level),
                    financialStatus: {
                        score: 85,
                        lastUpdated: new Date().toISOString(),
                    },
                    publicSentiment: {
                        score: 80,
                        source: 'manual',
                        lastUpdated: new Date().toISOString(),
                    },
                    productionAnomalies: {
                        count: 0,
                        severity: 'low',
                        source: 'manual',
                        lastUpdated: new Date().toISOString(),
                    },
                    legalRisks: {
                        score: 15,
                        source: 'auto',
                        lastUpdated: new Date().toISOString(),
                        risks: [],
                    },
                },
            };
        });

        console.log(`[HDSupplierDataLoader] Loaded ${scorecards.length} supplier scorecards`);
        return scorecards;
    } catch (error) {
        console.error('[HDSupplierDataLoader] Failed to load supplier scorecards:', error);
        return [];
    }
}

/**
 * Load HD supplier list
 * Returns basic supplier information
 */
export async function loadHDSupplierList(): Promise<any[]> {
    console.log('[HDSupplierDataLoader] Loading HD supplier list...');

    try {
        const suppliers = await loadSupplierEntities();
        console.log(`[HDSupplierDataLoader] Loaded ${suppliers.length} suppliers`);
        return suppliers;
    } catch (error) {
        console.error('[HDSupplierDataLoader] Failed to load supplier list:', error);
        return [];
    }
}

/**
 * Load HD supplier scorecard for a specific supplier
 * @param supplierId - Supplier ID
 */
export async function loadHDSupplierScorecard(supplierId: string): Promise<Supplier360Scorecard | null> {
    console.log(`[HDSupplierDataLoader] Loading scorecard for supplier: ${supplierId}`);

    try {
        const scorecards = await loadHDSupplier360Scorecards();
        const scorecard = scorecards.find(s => s.supplierId === supplierId);

        if (!scorecard) {
            console.warn(`[HDSupplierDataLoader] Scorecard not found for supplier: ${supplierId}`);
            return null;
        }

        return scorecard;
    } catch (error) {
        console.error(`[HDSupplierDataLoader] Failed to load scorecard for ${supplierId}:`, error);
        return null;
    }
}

// Helper functions

function normalizeRiskLevel(riskLevel: string | undefined): 'low' | 'medium' | 'high' | 'critical' {
    if (!riskLevel) return 'low';
    const normalized = riskLevel.toLowerCase().trim();
    if (normalized === '低' || normalized === 'low') return 'low';
    if (normalized === '中' || normalized === 'medium') return 'medium';
    if (normalized === '高' || normalized === 'high') return 'high';
    if (normalized === '严重' || normalized === 'critical') return 'critical';
    return 'low';
}

function getRiskRatingFromLevel(riskLevel: string | undefined): number {
    const normalized = normalizeRiskLevel(riskLevel);
    switch (normalized) {
        case 'low': return 20;
        case 'medium': return 50;
        case 'high': return 80;
        case 'critical': return 95;
        default: return 50;
    }
}
