// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { PlusCircle, Search, Eye, Edit, Trash2, Copy, Users } from 'lucide-react';
// import { withAuth } from '@/context/AuthContext';
// import { ProgramService, ProgramUtils } from '@/services/programs';
// import { ProgramList } from '@/types/api';

// function ProgramsPage() {
//   const router = useRouter();
//   const [programs, setPrograms] = useState<ProgramList[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<string>('all');
//   const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

//   useEffect(() => {
//     loadPrograms();
//   }, []);

//   const loadPrograms = async () => {
//     try {
//       setLoading(true);
//       const data = await ProgramService.getPrograms();
//       setPrograms(data);
//     } catch (error) {
//       console.error('Error loading programs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteProgram = async (programId: number) => {
//     if (!confirm('Are you sure you want to delete this program?')) return;
    
//     try {
//       await ProgramService.deleteProgram(programId);
//       setPrograms(prev => prev.filter(p => p.id !== programId));
//     } catch (error) {
//       console.error('Error deleting program:', error);
//       alert('Failed to delete program');
//     }
//   };

//   const filteredPrograms = programs.filter(program => {
//     const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = filterType === 'all' || program.program_type === filterType;
//     const matchesDifficulty = filterDifficulty === 'all' || program.difficulty_level === filterDifficulty;
    
//     return matchesSearch && matchesType && matchesDifficulty;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
//               <p className="text-gray-600 mt-2">Create and manage your workout programs</p>
//             </div>
//             <button
//               onClick={() => router.push('/programs/create')}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
//             >
//               <PlusCircle className="w-5 h-5" />
//               <span>Create Program</span>
//             </button>
//           </div>

//           {/* Search and Filters */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search programs..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <select
//                 value={filterType}
//                 onChange={(e) => setFilterType(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Types</option>
//                 <option value="strength">Strength</option>
//                 <option value="cardio">Cardio</option>
//                 <option value="flexibility">Flexibility</option>
//                 <option value="mixed">Mixed</option>
//                 <option value="rehabilitation">Rehabilitation</option>
//               </select>

//               <select
//                 value={filterDifficulty}
//                 onChange={(e) => setFilterDifficulty(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Difficulties</option>
//                 <option value="beginner">Beginner</option>
//                 <option value="intermediate">Intermediate</option>
//                 <option value="advanced">Advanced</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Programs Grid */}
//         {filteredPrograms.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
//               <Users className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
//             <p className="text-gray-600 mb-6">
//               {searchTerm || filterType !== 'all' || filterDifficulty !== 'all' 
//                 ? 'Try adjusting your search or filters'
//                 : 'Get started by creating your first training program'
//               }
//             </p>
//             {!searchTerm && filterType === 'all' && filterDifficulty === 'all' && (
//               <button
//                 onClick={() => router.push('/programs/create')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
//               >
//                 <PlusCircle className="w-5 h-5" />
//                 <span>Create Your First Program</span>
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredPrograms.map((program) => (
//               <div key={program.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex-1">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.name}</h3>
//                     </div>
//                     {program.is_template && (
//                       <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
//                         Template
//                       </span>
//                     )}
//                   </div>

//                   <div className="space-y-2 mb-4">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Type:</span>
//                       <span className="font-medium">{ProgramUtils.formatProgramType(program.program_type)}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Difficulty:</span>
//                       <span className={`font-medium ${
//                         program.difficulty_level === 'beginner' ? 'text-green-600' :
//                         program.difficulty_level === 'intermediate' ? 'text-yellow-600' : 'text-red-600'
//                       }`}>
//                         {ProgramUtils.formatDifficulty(program.difficulty_level)}
//                       </span>
//                     </div>
//                     {program.duration_weeks && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Duration:</span>
//                         <span className="font-medium">{program.duration_weeks} weeks</span>
//                       </div>
//                     )}
//                     {program.sessions_per_week && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Frequency:</span>
//                         <span className="font-medium">{program.sessions_per_week}x/week</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => router.push(`/programs/${program.id}`)}
//                       className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
//                     >
//                       <Eye className="w-4 h-4" />
//                       <span>View</span>
//                     </button>
                    
//                     <button
//                       onClick={() => router.push(`/programs/${program.id}/edit`)}
//                       className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
//                     >
//                       <Edit className="w-4 h-4" />
//                       <span>Edit</span>
//                     </button>

//                     <button
//                       onClick={() => handleDeleteProgram(program.id)}
//                       className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default withAuth(ProgramsPage);
