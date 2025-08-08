"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Edit, MapPin, Phone, Mail, School, Calendar, BookOpen, Target, Heart } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { StudentProfileForm } from '@/components/StudentProfileForm';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('gyaan_user');
    if (!userData) {
      router.push('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser.id) {
      router.push('/auth');
      return;
    }

    setUser(parsedUser);
    setUserLoading(false);
  }, [router]);

  // Use the custom hook for profile management
  const { profile, loading, error, refreshProfile } = useStudentProfile(user?.id);

  const handleProfileComplete = () => {
    setShowEditForm(false);
    // Refresh profile data
    refreshProfile();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showEditForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <StudentProfileForm 
          userId={user.id} 
          onComplete={handleProfileComplete}
          isEdit={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">Error loading profile</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => refreshProfile()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : !profile ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">Please complete your student profile to get started.</p>
            <StudentProfileForm 
              userId={user.id} 
              onComplete={handleProfileComplete}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600">Student Profile</p>
              </div>
              <Button onClick={() => setShowEditForm(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{profile.gender}</p>
                  </div>
                  {profile.blood_group && (
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{profile.blood_group}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">Class {profile.class} - Section {profile.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">School</p>
                    <p className="font-medium">{profile.school_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Board</p>
                    <p className="font-medium">{profile.school_board}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Parent/Guardian</p>
                    <p className="font-medium">{profile.parent_name}</p>
                    <p className="text-sm text-gray-600">{profile.parent_phone}</p>
                    {profile.parent_email && (
                      <p className="text-sm text-gray-600">{profile.parent_email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">{profile.emergency_contact}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{profile.address}</p>
                <p className="text-gray-600 mt-1">
                  {profile.city}, {profile.state} - {profile.pincode}
                </p>
              </CardContent>
            </Card>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Areas of Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals */}
            {profile.goals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Academic Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900">{profile.goals}</p>
                </CardContent>
              </Card>
            )}

            {/* Medical Information */}
            {profile.medical_conditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900">{profile.medical_conditions}</p>
                </CardContent>
              </Card>
            )}

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span>{formatDate(profile.created_at!)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{formatDate(profile.updated_at!)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 