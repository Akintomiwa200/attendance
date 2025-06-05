/*
  # Create attendances table

  1. New Tables
    - `attendances`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `name` (text)
      - `status` (text, either 'present' or 'absent')

  2. Security
    - Enable RLS on `attendances` table
    - Add policies for public access (read and insert)
*/

CREATE TABLE attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent'))
);

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON attendances
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON attendances
  FOR INSERT
  TO public
  WITH CHECK (true);