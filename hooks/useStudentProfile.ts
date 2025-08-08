import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface StudentProfile {
  id?: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  class: string;
  section: string;
  school_name: string;
  school_board: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact: string;
  blood_group: string;
  medical_conditions: string;
  interests: string[];
  goals: string;
  created_at?: string;
  updated_at?: string;
}

export interface UseStudentProfileReturn {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  createProfile: (profileData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProfile: (profileData: Partial<StudentProfile>) => Promise<boolean>;
  loadProfile: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useStudentProfile(userId?: string): UseStudentProfileReturn {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading profile for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No profile found - this is expected for new users
          console.log('No profile found for user - this is normal for new users');
          setProfile(null);
        } else {
          console.error('Profile loading error:', fetchError);
          setError(fetchError.message);
          throw fetchError;
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfile = useCallback(async (profileData: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating new profile:', profileData);
      
      const { data, error: createError } = await supabase
        .from('student_profiles')
        .insert([{
          ...profileData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        setError(createError.message);
        throw createError;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
      toast.success('Profile created successfully!');
      return true;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      toast.error('Failed to create profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (profileData: Partial<StudentProfile>): Promise<boolean> => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating profile:', profileData);
      
      const { data, error: updateError } = await supabase
        .from('student_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        setError(updateError.message);
        throw updateError;
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      toast.error('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (userId) {
      await loadProfile(userId);
    }
  }, [userId, loadProfile]);

  // Load profile when userId changes
  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    loadProfile,
    refreshProfile,
  };
} 