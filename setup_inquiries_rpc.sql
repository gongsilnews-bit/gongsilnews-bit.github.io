CREATE OR REPLACE FUNCTION get_masked_inquiries(p_property_id uuid)
RETURNS TABLE (
    id uuid,
    property_id uuid,
    created_at timestamptz,
    author_id uuid,
    realtor_id uuid,
    content text,
    answer text,
    answered_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.property_id,
        i.created_at,
        i.author_id,
        i.realtor_id,
        CASE WHEN auth.uid() = i.author_id OR auth.uid() = i.realtor_id THEN i.content ELSE '비공개'::text END,
        CASE WHEN auth.uid() = i.author_id OR auth.uid() = i.realtor_id THEN i.answer ELSE (CASE WHEN i.answer IS NOT NULL THEN '비공개'::text ELSE NULL END) END,
        i.answered_at
    FROM property_inquiries i
    WHERE i.property_id = p_property_id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
