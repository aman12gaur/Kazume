"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { toast } from 'sonner';

export function ProfileTest() {
  const [testUserId] = useState('test-user-123');
  const { profile, loading, error, createProfile, updateProfile, refreshProfile } = useStudentProfile(testUserId);

  const testCreateProfile = async () => {
    const testProfile = {
      user_id: testUserId,
      full_name: 'Test Student',
      date_of_birth: '2010-01-01',
      gender: 'male',
      class: '10',
      section: 'A',
      school_name: 'Test School',
      school_board: 'CBSE',
      parent_name: 'Test Parent',
      parent_phone: '1234567890',
      parent_email: 'parent@test.com',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      emergency_contact: '0987654321',
      blood_group: 'O+',
      medical_conditions: 'None',
      interests: ['Mathematics', 'Science'],
      goals: 'To excel in academics',
    };

    const success = await createProfile(testProfile);
    if (success) {
      toast.success('Test profile created successfully!');
    }
  };

  const testUpdateProfile = async () => {
    if (!profile) {
      toast.error('No profile to update');
      return;
    }

    const success = await updateProfile({
      full_name: 'Updated Test Student',
      goals: 'Updated academic goals',
    });

    if (success) {
      toast.success('Test profile updated successfully!');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <CardHeader>
        <CardTitle>Student Profile Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testCreateProfile} disabled={loading}>
            Create Test Profile
          </Button>
          <Button onClick={testUpdateProfile} disabled={loading || !profile}>
            Update Test Profile
          </Button>
          <Button onClick={refreshProfile} disabled={loading}>
            Refresh Profile
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Status:</h3>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>Profile exists: {profile ? 'Yes' : 'No'}</p>
        </div>

        {profile && (
          <div className="space-y-2">
            <h3 className="font-semibold">Current Profile:</h3>
            <p>Name: {profile.full_name}</p>
            <p>Class: {profile.class}</p>
            <p>School: {profile.school_name}</p>
            <p>Goals: {profile.goals}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 