CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
CREATE POLICY "Users can read their own roles and admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.nafdac_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  registration_number TEXT,
  product_category TEXT,
  marketing_category TEXT,
  source_status TEXT NOT NULL DEFAULT 'Unknown',
  derived_verification_status TEXT NOT NULL DEFAULT 'unknown',
  applicant_name TEXT,
  manufacturer_name TEXT,
  active_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredient_synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  composition JSONB,
  dosage_form TEXT,
  route_of_administration TEXT,
  strength TEXT,
  pack_size TEXT,
  atc_code TEXT,
  approval_date DATE,
  registration_expiry_date DATE,
  product_detail_url TEXT,
  product_information_url TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  first_imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nafdac_products TO authenticated;
GRANT ALL ON public.nafdac_products TO service_role;
ALTER TABLE public.nafdac_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage NAFDAC products" ON public.nafdac_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX nafdac_products_registration_number_idx ON public.nafdac_products (registration_number);
CREATE INDEX nafdac_products_product_name_idx ON public.nafdac_products (lower(product_name));
CREATE INDEX nafdac_products_status_idx ON public.nafdac_products (derived_verification_status);

CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  total_records_received INTEGER NOT NULL DEFAULT 0,
  records_imported INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  duplicate_records INTEGER NOT NULL DEFAULT 0,
  rejected_records INTEGER NOT NULL DEFAULT 0,
  records_flagged INTEGER NOT NULL DEFAULT 0,
  import_status TEXT NOT NULL DEFAULT 'in_progress',
  error_report JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage import batches" ON public.import_batches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX import_batches_started_at_idx ON public.import_batches (started_at DESC);

CREATE TABLE public.staging_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  source_product_id TEXT,
  registration_number TEXT,
  raw_payload JSONB NOT NULL,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staging_records TO authenticated;
GRANT ALL ON public.staging_records TO service_role;
ALTER TABLE public.staging_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage staging records" ON public.staging_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX staging_records_batch_id_idx ON public.staging_records (batch_id);
CREATE INDEX staging_records_source_product_id_idx ON public.staging_records (source_product_id);

CREATE TABLE public.registration_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.nafdac_products(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  source_observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_status_history TO authenticated;
GRANT ALL ON public.registration_status_history TO service_role;
ALTER TABLE public.registration_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage registration history" ON public.registration_status_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX registration_status_history_product_idx ON public.registration_status_history (product_id, created_at DESC);

CREATE TABLE public.product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.nafdac_products(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  ingredient_synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  strength TEXT,
  composition_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, ingredient_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_ingredients TO authenticated;
GRANT ALL ON public.product_ingredients TO service_role;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage product ingredients" ON public.product_ingredients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX product_ingredients_name_idx ON public.product_ingredients (lower(ingredient_name));

CREATE OR REPLACE FUNCTION public.nafdac_is_iso_date(_value TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF _value IS NULL OR btrim(_value) = '' THEN RETURN TRUE; END IF;
  IF _value !~ '^\\d{4}-\\d{2}-\\d{2}$' THEN RETURN FALSE; END IF;
  PERFORM make_date(split_part(_value, '-', 1)::INTEGER, split_part(_value, '-', 2)::INTEGER, split_part(_value, '-', 3)::INTEGER);
  RETURN TRUE;
EXCEPTION WHEN others THEN
  RETURN FALSE;
END;
$$;
REVOKE ALL ON FUNCTION public.nafdac_is_iso_date(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nafdac_is_iso_date(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', '')),
    NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(COALESCE(NEW.email, '')) = 'joyetomi28@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_profile_and_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.search_nafdac_products(_query TEXT, _limit INTEGER DEFAULT 20)
RETURNS TABLE (
  product_name TEXT,
  registration_number TEXT,
  source_status TEXT,
  derived_verification_status TEXT,
  product_category TEXT,
  marketing_category TEXT,
  applicant_name TEXT,
  manufacturer_name TEXT,
  active_ingredients JSONB,
  composition JSONB,
  dosage_form TEXT,
  route_of_administration TEXT,
  strength TEXT,
  pack_size TEXT,
  approval_date DATE,
  registration_expiry_date DATE,
  last_verified_at TIMESTAMPTZ,
  product_detail_url TEXT,
  review_flags JSONB
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.product_name, p.registration_number, p.source_status, p.derived_verification_status,
         p.product_category, p.marketing_category, p.applicant_name, p.manufacturer_name,
         p.active_ingredients, p.composition, p.dosage_form, p.route_of_administration,
         p.strength, p.pack_size, p.approval_date, p.registration_expiry_date,
         p.last_verified_at, p.product_detail_url, p.review_flags
  FROM public.nafdac_products p
  WHERE length(btrim(COALESCE(_query, ''))) BETWEEN 2 AND 200
    AND (
      p.product_name ILIKE '%' || btrim(_query) || '%'
      OR COALESCE(p.registration_number, '') ILIKE '%' || btrim(_query) || '%'
      OR COALESCE(p.applicant_name, '') ILIKE '%' || btrim(_query) || '%'
      OR COALESCE(p.manufacturer_name, '') ILIKE '%' || btrim(_query) || '%'
      OR p.active_ingredients::TEXT ILIKE '%' || btrim(_query) || '%'
    )
  ORDER BY (lower(p.registration_number) = lower(btrim(_query))) DESC,
           (p.derived_verification_status = 'active') DESC,
           lower(p.product_name)
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 50)
$$;
REVOKE ALL ON FUNCTION public.search_nafdac_products(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_nafdac_products(TEXT, INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_nafdac_import(_source TEXT, _batch_name TEXT, _total INTEGER DEFAULT 0)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF _source NOT IN ('apify', 'json_upload') OR length(btrim(COALESCE(_batch_name, ''))) NOT BETWEEN 1 AND 200 OR COALESCE(_total, 0) < 0 THEN
    RAISE EXCEPTION 'Invalid import batch details';
  END IF;
  INSERT INTO public.import_batches (source, batch_name, total_records_received)
  VALUES (_source, btrim(_batch_name), 0) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_nafdac_import(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_nafdac_import(TEXT, TEXT, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.process_nafdac_import_chunk(_batch_id UUID, _records JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record JSONB;
  v_source_id TEXT;
  v_registration TEXT;
  v_name TEXT;
  v_source_status TEXT;
  v_derived_status TEXT;
  v_approval TEXT;
  v_expiry TEXT;
  v_applicant TEXT;
  v_manufacturer TEXT;
  v_flags JSONB;
  v_errors JSONB;
  v_seen TEXT[] := ARRAY[]::TEXT[];
  v_existing public.nafdac_products%ROWTYPE;
  v_product_id UUID;
  v_is_update BOOLEAN;
  v_dup_reg_count INTEGER;
  v_received INTEGER := 0;
  v_imported INTEGER := 0;
  v_updated INTEGER := 0;
  v_duplicates INTEGER := 0;
  v_rejected INTEGER := 0;
  v_flagged INTEGER := 0;
  v_ingredient TEXT;
BEGIN
  IF jsonb_typeof(_records) <> 'array' OR jsonb_array_length(_records) > 100 THEN RAISE EXCEPTION 'Each import chunk must contain at most 100 records'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.import_batches WHERE id = _batch_id AND import_status = 'in_progress') THEN RAISE EXCEPTION 'Import batch is not active'; END IF;

  FOR v_record IN SELECT value FROM jsonb_array_elements(_records) LOOP
    v_received := v_received + 1;
    v_source_id := COALESCE(NULLIF(btrim(COALESCE(v_record->>'source_product_id', v_record->>'sourceProductId', v_record->>'productId')), ''), NULL);
    v_registration := NULLIF(btrim(COALESCE(v_record->>'registration_number', v_record->>'registrationNumber', v_record->>'NAFDAC')), '');
    v_name := NULLIF(btrim(COALESCE(v_record->>'product_name', v_record->>'productName')), '');
    v_source_status := COALESCE(NULLIF(btrim(COALESCE(v_record->>'source_status', v_record->>'status')), ''), 'Unknown');
    v_approval := NULLIF(btrim(COALESCE(v_record->>'approval_date', v_record->>'approvedAt')), '');
    v_expiry := NULLIF(btrim(COALESCE(v_record->>'registration_expiry_date', v_record->>'expiresAt')), '');
    v_applicant := NULLIF(btrim(COALESCE(v_record->>'applicant_name', v_record #>> '{applicant,name}')), '');
    v_manufacturer := NULLIF(btrim(COALESCE(v_record->>'manufacturer_name', v_record #>> '{manufacturer,name}')), '');
    v_flags := '[]'::jsonb;
    v_errors := '[]'::jsonb;

    IF v_source_id IS NULL THEN v_errors := v_errors || jsonb_build_array('Missing source product ID'); END IF;
    IF v_name IS NULL THEN v_errors := v_errors || jsonb_build_array('Missing product name'); END IF;
    IF NOT public.nafdac_is_iso_date(v_approval) THEN v_errors := v_errors || jsonb_build_array('Invalid approval date'); END IF;
    IF NOT public.nafdac_is_iso_date(v_expiry) THEN v_errors := v_errors || jsonb_build_array('Invalid registration expiry date'); END IF;
    IF v_registration IS NULL THEN v_flags := v_flags || jsonb_build_array('Missing registration number'); END IF;
    IF lower(v_source_status) NOT IN ('active', 'inactive', 'expired', 'suspended', 'withdrawn') THEN v_flags := v_flags || jsonb_build_array('Unknown source status'); END IF;

    IF v_source_id IS NOT NULL AND v_source_id = ANY(v_seen) THEN
      v_duplicates := v_duplicates + 1;
      INSERT INTO public.staging_records (batch_id, source_product_id, registration_number, raw_payload, validation_status, validation_errors, processed_at)
      VALUES (_batch_id, v_source_id, v_registration, v_record, 'duplicate', jsonb_build_array('Duplicate source product ID within this import chunk'), now());
      CONTINUE;
    END IF;
    IF v_source_id IS NOT NULL THEN v_seen := array_append(v_seen, v_source_id); END IF;

    IF v_errors <> '[]'::jsonb THEN
      v_rejected := v_rejected + 1;
      INSERT INTO public.staging_records (batch_id, source_product_id, registration_number, raw_payload, validation_status, validation_errors, processed_at)
      VALUES (_batch_id, v_source_id, v_registration, v_record, 'rejected', v_errors, now());
      CONTINUE;
    END IF;

    SELECT * INTO v_existing FROM public.nafdac_products WHERE source_product_id = v_source_id;
    v_is_update := FOUND;
    SELECT count(*) INTO v_dup_reg_count FROM public.nafdac_products p WHERE v_registration IS NOT NULL AND p.registration_number = v_registration AND p.source_product_id <> v_source_id;
    IF v_dup_reg_count > 0 THEN v_flags := v_flags || jsonb_build_array('Registration number is shared by multiple source records'); END IF;
    IF lower(v_source_status) = 'active' AND v_expiry IS NOT NULL AND v_expiry::DATE < current_date THEN
      v_flags := v_flags || jsonb_build_array('Source says active but the registration expiry date has passed');
      v_derived_status := 'expired';
    ELSE
      v_derived_status := CASE lower(v_source_status)
        WHEN 'active' THEN 'active'
        WHEN 'inactive' THEN 'inactive'
        WHEN 'expired' THEN 'expired'
        WHEN 'suspended' THEN 'suspended'
        WHEN 'withdrawn' THEN 'withdrawn'
        ELSE 'unknown'
      END;
    END IF;

    INSERT INTO public.staging_records (batch_id, source_product_id, registration_number, raw_payload, validation_status, validation_errors, processed_at)
    VALUES (_batch_id, v_source_id, v_registration, v_record, CASE WHEN v_flags = '[]'::jsonb THEN 'valid' ELSE 'flagged' END, v_flags, now());

    IF v_is_update THEN
      UPDATE public.nafdac_products SET
        product_name = v_name,
        registration_number = v_registration,
        product_category = NULLIF(btrim(COALESCE(v_record->>'product_category', v_record->>'category')), ''),
        marketing_category = NULLIF(btrim(COALESCE(v_record->>'marketing_category', v_record->>'marketingCategory')), ''),
        source_status = v_source_status,
        derived_verification_status = v_derived_status,
        applicant_name = v_applicant,
        manufacturer_name = v_manufacturer,
        active_ingredients = CASE WHEN jsonb_typeof(v_record->'activeIngredients') = 'array' THEN v_record->'activeIngredients' ELSE '[]'::jsonb END,
        ingredient_synonyms = CASE WHEN v_record ? 'ingredientSynonym' AND v_record->>'ingredientSynonym' IS NOT NULL THEN jsonb_build_array(v_record->>'ingredientSynonym') ELSE '[]'::jsonb END,
        composition = COALESCE(v_record->'composition', 'null'::jsonb),
        dosage_form = NULLIF(btrim(COALESCE(v_record->>'dosage_form', v_record->>'dosageForm')), ''),
        route_of_administration = NULLIF(btrim(COALESCE(v_record->>'route_of_administration', v_record->>'route')), ''),
        strength = NULLIF(btrim(v_record->>'strength'), ''),
        pack_size = NULLIF(btrim(COALESCE(v_record->>'pack_size', v_record->>'packSize')), ''),
        atc_code = NULLIF(btrim(COALESCE(v_record->>'atc_code', v_record->>'atcCode')), ''),
        approval_date = v_approval::DATE,
        registration_expiry_date = v_expiry::DATE,
        product_detail_url = NULLIF(btrim(COALESCE(v_record->>'product_detail_url', v_record->>'detailUrl')), ''),
        product_information_url = NULLIF(btrim(COALESCE(v_record->>'product_information_url', v_record->>'smpcUrl')), ''),
        raw_payload = v_record,
        review_flags = v_flags,
        last_updated_at = now(), last_verified_at = now(), updated_at = now()
      WHERE id = v_existing.id RETURNING id INTO v_product_id;
      v_updated := v_updated + 1;
      IF v_existing.source_status IS DISTINCT FROM v_source_status THEN
        INSERT INTO public.registration_status_history (product_id, previous_status, new_status, source_observed_at, source_batch_id)
        VALUES (v_product_id, v_existing.source_status, v_source_status, now(), _batch_id);
      END IF;
    ELSE
      INSERT INTO public.nafdac_products (
        source_product_id, product_name, registration_number, product_category, marketing_category,
        source_status, derived_verification_status, applicant_name, manufacturer_name,
        active_ingredients, ingredient_synonyms, composition, dosage_form, route_of_administration,
        strength, pack_size, atc_code, approval_date, registration_expiry_date,
        product_detail_url, product_information_url, raw_payload, review_flags
      ) VALUES (
        v_source_id, v_name, v_registration,
        NULLIF(btrim(COALESCE(v_record->>'product_category', v_record->>'category')), ''),
        NULLIF(btrim(COALESCE(v_record->>'marketing_category', v_record->>'marketingCategory')), ''),
        v_source_status, v_derived_status, v_applicant, v_manufacturer,
        CASE WHEN jsonb_typeof(v_record->'activeIngredients') = 'array' THEN v_record->'activeIngredients' ELSE '[]'::jsonb END,
        CASE WHEN v_record ? 'ingredientSynonym' AND v_record->>'ingredientSynonym' IS NOT NULL THEN jsonb_build_array(v_record->>'ingredientSynonym') ELSE '[]'::jsonb END,
        COALESCE(v_record->'composition', 'null'::jsonb),
        NULLIF(btrim(COALESCE(v_record->>'dosage_form', v_record->>'dosageForm')), ''),
        NULLIF(btrim(COALESCE(v_record->>'route_of_administration', v_record->>'route')), ''),
        NULLIF(btrim(v_record->>'strength'), ''),
        NULLIF(btrim(COALESCE(v_record->>'pack_size', v_record->>'packSize')), ''),
        NULLIF(btrim(COALESCE(v_record->>'atc_code', v_record->>'atcCode')), ''),
        v_approval::DATE, v_expiry::DATE,
        NULLIF(btrim(COALESCE(v_record->>'product_detail_url', v_record->>'detailUrl')), ''),
        NULLIF(btrim(COALESCE(v_record->>'product_information_url', v_record->>'smpcUrl')), ''),
        v_record, v_flags
      ) RETURNING id INTO v_product_id;
      v_imported := v_imported + 1;
    END IF;

    IF jsonb_typeof(v_record->'activeIngredients') = 'array' THEN
      FOR v_ingredient IN SELECT btrim(value) FROM jsonb_array_elements_text(v_record->'activeIngredients') WHERE btrim(value) <> '' LOOP
        INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_synonyms, strength, composition_details)
        VALUES (v_product_id, v_ingredient,
                CASE WHEN v_record ? 'ingredientSynonym' AND v_record->>'ingredientSynonym' IS NOT NULL THEN jsonb_build_array(v_record->>'ingredientSynonym') ELSE '[]'::jsonb END,
                NULLIF(btrim(v_record->>'strength'), ''), COALESCE(v_record->'composition', 'null'::jsonb))
        ON CONFLICT (product_id, ingredient_name) DO UPDATE SET ingredient_synonyms = EXCLUDED.ingredient_synonyms, strength = EXCLUDED.strength, composition_details = EXCLUDED.composition_details;
      END LOOP;
    END IF;
    IF jsonb_array_length(v_flags) > 0 THEN v_flagged := v_flagged + 1; END IF;
  END LOOP;

  UPDATE public.import_batches SET
    total_records_received = total_records_received + v_received,
    records_imported = records_imported + v_imported,
    records_updated = records_updated + v_updated,
    duplicate_records = duplicate_records + v_duplicates,
    rejected_records = rejected_records + v_rejected,
    records_flagged = records_flagged + v_flagged
  WHERE id = _batch_id;
  RETURN jsonb_build_object('received', v_received, 'imported', v_imported, 'updated', v_updated, 'duplicates', v_duplicates, 'rejected', v_rejected, 'flagged', v_flagged);
END;
$$;
REVOKE ALL ON FUNCTION public.process_nafdac_import_chunk(UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_nafdac_import_chunk(UUID, JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.finish_nafdac_import(_batch_id UUID, _status TEXT, _errors JSONB DEFAULT '[]'::jsonb)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _status NOT IN ('completed', 'failed', 'partial') THEN RAISE EXCEPTION 'Invalid import status'; END IF;
  UPDATE public.import_batches SET import_status = _status, error_report = COALESCE(_errors, '[]'::jsonb), completed_at = now() WHERE id = _batch_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Import batch not found'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.finish_nafdac_import(UUID, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_nafdac_import(UUID, TEXT, JSONB) TO service_role;