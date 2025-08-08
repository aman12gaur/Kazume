"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Save, Loader2 } from 'lucide-react';
import { useStudentProfile, StudentProfile } from '@/hooks/useStudentProfile';
import { toast } from 'sonner';

interface StudentProfileFormProps {
  userId: string;
  onComplete?: () => void;
  isEdit?: boolean;
}

const CLASS_OPTIONS = [
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const SECTION_OPTIONS = [
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
  { value: 'D', label: 'Section D' },
  { value: 'E', label: 'Section E' },
];

const BOARD_OPTIONS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'State Board', label: 'State Board' },
  { value: 'International', label: 'International' },
];

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const INTEREST_OPTIONS = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Computer Science', 'Arts', 'Sports', 'Music', 'Dance',
  'Reading', 'Writing', 'Cooking', 'Photography', 'Gaming'
];

export function StudentProfileForm({ userId, onComplete, isEdit = false }: StudentProfileFormProps) {
  const [formLoading, setFormLoading] = useState(false);
  const [profile, setProfile] = useState<Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>>({
    user_id: userId,
    full_name: '',
    date_of_birth: '',
    gender: '',
    class: '',
    section: '',
    school_name: '',
    school_board: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergency_contact: '',
    blood_group: '',
    medical_conditions: '',
    interests: [],
    goals: '',
  });

  // Use the custom hook for profile management
  const { profile: existingProfile, loading: profileLoading, createProfile, updateProfile } = useStudentProfile(userId);

  // Load existing profile if editing
  useEffect(() => {
    if (isEdit && existingProfile) {
      console.log('Loading profile for editing:', existingProfile);
      setProfile({
        user_id: userId,
        full_name: existingProfile.full_name,
        date_of_birth: existingProfile.date_of_birth,
        gender: existingProfile.gender,
        class: existingProfile.class,
        section: existingProfile.section,
        school_name: existingProfile.school_name,
        school_board: existingProfile.school_board,
        parent_name: existingProfile.parent_name,
        parent_phone: existingProfile.parent_phone,
        parent_email: existingProfile.parent_email,
        address: existingProfile.address,
        city: existingProfile.city,
        state: existingProfile.state,
        pincode: existingProfile.pincode,
        emergency_contact: existingProfile.emergency_contact,
        blood_group: existingProfile.blood_group,
        medical_conditions: existingProfile.medical_conditions,
        interests: existingProfile.interests || [],
        goals: existingProfile.goals,
      });
    }
  }, [isEdit, existingProfile, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      console.log('Submitting profile data:', profile);
      
      let success = false;
      if (isEdit) {
        console.log('Updating existing profile...');
        success = await updateProfile(profile);
      } else {
        console.log('Creating new profile...');
        success = await createProfile(profile);
      }

      if (success) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please check your connection and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  if (profileLoading && isEdit) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEdit ? 'Edit Student Profile' : 'Complete Your Student Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select value={profile.blood_group} onValueChange={(value) => setProfile(prev => ({ ...prev, blood_group: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={profile.class} onValueChange={(value) => setProfile(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select value={profile.section} onValueChange={(value) => setProfile(prev => ({ ...prev, section: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_board">School Board *</Label>
                <Select value={profile.school_board} onValueChange={(value) => setProfile(prev => ({ ...prev, school_board: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_name">School Name *</Label>
              <Input
                id="school_name"
                value={profile.school_name}
                onChange={(e) => setProfile(prev => ({ ...prev, school_name: e.target.value }))}
                required
              />
            </div>

            {/* Parent/Guardian Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
                <Input
                  id="parent_name"
                  value={profile.parent_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, parent_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_phone">Parent/Guardian Phone *</Label>
                <Input
                  id="parent_phone"
                  type="tel"
                  value={profile.parent_phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, parent_phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent/Guardian Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={profile.parent_email}
                  onChange={(e) => setProfile(prev => ({ ...prev, parent_email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact *</Label>
                <Input
                  id="emergency_contact"
                  type="tel"
                  value={profile.emergency_contact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={profile.pincode}
                  onChange={(e) => setProfile(prev => ({ ...prev, pincode: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-2">
              <Label htmlFor="medical_conditions">Medical Conditions (if any)</Label>
              <Textarea
                id="medical_conditions"
                value={profile.medical_conditions}
                onChange={(e) => setProfile(prev => ({ ...prev, medical_conditions: e.target.value }))}
                placeholder="Please mention any medical conditions, allergies, or special requirements..."
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Areas of Interest</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INTEREST_OPTIONS.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={profile.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    />
                    <Label htmlFor={interest} className="text-sm">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label htmlFor="goals">Academic Goals</Label>
              <Textarea
                id="goals"
                value={profile.goals}
                onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="What are your academic goals? What subjects do you want to improve in?"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={formLoading} className="flex items-center gap-2">
                {formLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? 'Update Profile' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 