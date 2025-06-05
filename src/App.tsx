import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from './lib/supabase';

interface Attendance {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  status: 'present' | 'absent';
}

function App() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    // Initial fetch of attendances
    fetchAttendances();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendances'
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchAttendances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAttendances = async () => {
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendances:', error);
      return;
    }

    setAttendances(data);
  };

  const markAttendance = async (status: 'present' | 'absent') => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    const { error } = await supabase
      .from('attendances')
      .insert([
        {
          name: name.trim(),
          status,
        }
      ]);

    if (error) {
      console.error('Error marking attendance:', error);
      return;
    }

    setName('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Attendance System</h1>
                
                <div className="mb-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <div className="mt-4 space-x-4">
                    <button
                      onClick={() => markAttendance('present')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark Present
                    </button>
                    <button
                      onClick={() => markAttendance('absent')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Mark Absent
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Attendance Log</h2>
                  <div className="space-y-4">
                    {attendances.map((attendance) => (
                      <div
                        key={attendance.id}
                        className={`p-4 rounded-lg ${
                          attendance.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <p className="font-semibold">{attendance.name}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(attendance.created_at), 'PPpp')}
                        </p>
                        <p className="text-sm font-medium capitalize">
                          Status: {attendance.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;