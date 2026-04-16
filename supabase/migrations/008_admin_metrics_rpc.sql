-- Migration: 008_admin_metrics_rpc
-- Date: 2026-04-15
-- Description: RPC for secure Founder-level metric aggregation

CREATE OR REPLACE FUNCTION get_platform_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users BIGINT;
    total_scans BIGINT;
    total_resumes BIGINT;
    bot_scans BIGINT;
    active_mrr NUMERIC;
    result JSONB;
BEGIN
    SELECT count(*) INTO total_users FROM profiles;
    SELECT count(*) INTO total_scans FROM ats_scores;
    SELECT count(*) INTO total_resumes FROM resumes;
    SELECT count(*) INTO bot_scans FROM bot_extractions;
    
    SELECT COALESCE(sum(amount), 0) INTO active_mrr 
    FROM subscriptions 
    WHERE status = 'active';

    result := jsonb_build_object(
        'users', jsonb_build_object('total', total_users),
        'scans', jsonb_build_object(
            'total', total_scans,
            'bot_contribution', bot_scans,
            'web_contribution', total_scans - bot_scans
        ),
        'content', jsonb_build_object('resumes_generated', total_resumes),
        'business', jsonb_build_object(
            'active_mrr', active_mrr,
            'currency', 'USD'
        )
    );

    RETURN result;
END;
$$;
