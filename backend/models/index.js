/**
 * Sequelize Models Index
 * 
 * This file imports and initializes all Sequelize models
 * and defines their relationships (associations)
 */

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// ============================================
// DEFINE ALL MODELS
// ============================================

// 1. User Model
const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    userType: {
        type: DataTypes.ENUM('Admin', 'Faculty'),
        allowNull: false,
        defaultValue: 'Faculty'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 2. Program Model
const Program = sequelize.define('programs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    programName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    programCode: {
        type: DataTypes.STRING(50)
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 3. Branch Model
const Branch = sequelize.define('branches', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branchName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    branchCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 4. Regulation Model
const Regulation = sequelize.define('regulations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    regulationName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    regulationYear: {
        type: DataTypes.INTEGER
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 5. Program-Branch Mapping Model
const ProgramBranchMapping = sequelize.define('program_branch_mapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    programId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 6. Course Model
const Course = sequelize.define('courses', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    courseCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    regulationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.ENUM('I', 'II', 'III', 'IV'),
        allowNull: false
    },
    semester: {
        type: DataTypes.ENUM('I', 'II'),
        allowNull: false
    },
    courseType: {
        type: DataTypes.ENUM('Theory', 'Lab', 'Project', 'Seminar'),
        allowNull: false
    },
    electiveType: {
        type: DataTypes.ENUM('CORE', 'Professional Elective', 'Open Elective'),
        allowNull: false
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 7. Branch-Course Mapping Model
const BranchCourseMapping = sequelize.define('branch_course_mapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pbMappingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    regulationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 8. Faculty Model
const Faculty = sequelize.define('faculty', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    honorific: {
        type: DataTypes.ENUM('Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.'),
        defaultValue: 'Mr.'
    },
    facultyName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    empId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING(20)
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 9. Faculty-Course Mapping Model
const FacultyCourseMapping = sequelize.define('faculty_course_mapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    facultyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseType: {
        type: DataTypes.ENUM('Theory', 'Lab', 'Project', 'Seminar'),
        allowNull: false
    },
    year: {
        type: DataTypes.ENUM('I', 'II', 'III', 'IV'),
        allowNull: false
    },
    semester: {
        type: DataTypes.ENUM('I', 'II'),
        allowNull: false
    },
    academicYear: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    electiveType: {
        type: DataTypes.ENUM('CORE', 'Professional Elective', 'Open Elective'),
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 10. Bloom's Level Model
const BloomsLevel = sequelize.define('blooms_level', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    levelName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    levelNumber: {
        type: DataTypes.INTEGER
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 11. Difficulty Level Model
const DifficultyLevel = sequelize.define('difficulty_level', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    levelName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 12. Unit Model
const Unit = sequelize.define('units', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    unitName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    unitNumber: {
        type: DataTypes.INTEGER
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 13. Course Outcome Model
const CourseOutcome = sequelize.define('course_outcomes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    coNumber: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    coDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// 14. Question Model
const Question = sequelize.define('questions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    coId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bloomsLevelId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    difficultyLevelId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagePath: {
        type: DataTypes.STRING(500)
    },
    marks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

// 15. Generated QP Model
const GeneratedQP = sequelize.define('generated_qp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    programId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assessmentType: {
        type: DataTypes.ENUM('MID-1', 'MID-2', 'Regular', 'Supply'),
        allowNull: false
    },
    examDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    regulationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.ENUM('I', 'II', 'III', 'IV'),
        allowNull: false
    },
    semester: {
        type: DataTypes.ENUM('I', 'II'),
        allowNull: false
    },
    academicYear: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    questionPaperData: {
        type: DataTypes.JSON
    },
    pdfPath: {
        type: DataTypes.STRING(500)
    },
    generatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

// ============================================
// DEFINE ASSOCIATIONS (Relationships)
// ============================================

// User - Faculty (One-to-One)
User.hasOne(Faculty, { foreignKey: 'userId', as: 'facultyProfile' });
Faculty.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Program - ProgramBranchMapping (One-to-Many)
Program.hasMany(ProgramBranchMapping, { foreignKey: 'programId', as: 'branchMappings' });
ProgramBranchMapping.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

// Branch - ProgramBranchMapping (One-to-Many)
Branch.hasMany(ProgramBranchMapping, { foreignKey: 'branchId', as: 'programMappings' });
ProgramBranchMapping.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Branch - Course (One-to-Many)
Branch.hasMany(Course, { foreignKey: 'branchId', as: 'courses' });
Course.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Regulation - Course (One-to-Many)
Regulation.hasMany(Course, { foreignKey: 'regulationId', as: 'courses' });
Course.belongsTo(Regulation, { foreignKey: 'regulationId', as: 'regulation' });

// Branch - Faculty (One-to-Many)
Branch.hasMany(Faculty, { foreignKey: 'branchId', as: 'facultyMembers' });
Faculty.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Course - FacultyCourseMapping (One-to-Many)
Course.hasMany(FacultyCourseMapping, { foreignKey: 'courseId', as: 'facultyMappings' });
FacultyCourseMapping.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Faculty - FacultyCourseMapping (One-to-Many)
Faculty.hasMany(FacultyCourseMapping, { foreignKey: 'facultyId', as: 'courseMappings' });
FacultyCourseMapping.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

// Course - CourseOutcome (One-to-Many)
Course.hasMany(CourseOutcome, { foreignKey: 'courseId', as: 'outcomes' });
CourseOutcome.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course - Question (One-to-Many)
Course.hasMany(Question, { foreignKey: 'courseId', as: 'questions' });
Question.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// CourseOutcome - Question (One-to-Many)
CourseOutcome.hasMany(Question, { foreignKey: 'coId', as: 'questions' });
Question.belongsTo(CourseOutcome, { foreignKey: 'coId', as: 'courseOutcome' });

// BloomsLevel - Question (One-to-Many)
BloomsLevel.hasMany(Question, { foreignKey: 'bloomsLevelId', as: 'questions' });
Question.belongsTo(BloomsLevel, { foreignKey: 'bloomsLevelId', as: 'bloomsLevel' });

// DifficultyLevel - Question (One-to-Many)
DifficultyLevel.hasMany(Question, { foreignKey: 'difficultyLevelId', as: 'questions' });
Question.belongsTo(DifficultyLevel, { foreignKey: 'difficultyLevelId', as: 'difficultyLevel' });

// Unit - Question (One-to-Many)
Unit.hasMany(Question, { foreignKey: 'unitId', as: 'questions' });
Question.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });

// Faculty - Question (One-to-Many) - createdBy
Faculty.hasMany(Question, { foreignKey: 'createdBy', as: 'createdQuestions' });
Question.belongsTo(Faculty, { foreignKey: 'createdBy', as: 'creator' });

// Export all models
module.exports = {
    sequelize,
    User,
    Program,
    Branch,
    Regulation,
    ProgramBranchMapping,
    Course,
    BranchCourseMapping,
    Faculty,
    FacultyCourseMapping,
    BloomsLevel,
    DifficultyLevel,
    Unit,
    CourseOutcome,
    Question,
    GeneratedQP
};
