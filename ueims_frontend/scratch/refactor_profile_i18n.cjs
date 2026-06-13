const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'FPT', 'SWP391', 'ueims', 'UEIMS_Project', 'ueims_frontend', 'src', 'pages', 'student', 'tabs', 'ProfileTab.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes("import { useTranslation }")) {
  content = content.replace(
    /import React,\s*\{\s*useEffect,\s*useState\s*\}\s*from\s*'react';/,
    "import React, { useEffect, useState } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
}

// Add hooks
content = content.replace(
  /const TabSwitcher: React\.FC<\{ active: ProfileView; onChange: \(v: ProfileView\) => void \}> = \(\{ active, onChange \}\) => \(/,
  "const TabSwitcher: React.FC<{ active: ProfileView; onChange: (v: ProfileView) => void }> = ({ active, onChange }) => {\n  const { t } = useTranslation(['profile', 'common']);\n  return ("
);
content = content.replace(
  /(\s*\{\s*v === 'profile'\s*\?\s*(?:'Profile Info'|t\('profileInfo',\s*'Profile Info'\))\s*:\s*(?:'My CVs'|t\('myCvs',\s*'My CVs'\))\s*\}\s*<\/button>\s*\);\s*\}\)\}\s*<\/div>\s*)\);/,
  "$1  );\n};"
);

content = content.replace(
  /const StatusPill: React\.FC<\{ status\?: string \}> = \(\{ status \}\) => \{/,
  "const StatusPill: React.FC<{ status?: string }> = ({ status }) => {\n  const { t } = useTranslation(['profile']);"
);

content = content.replace(
  /const ProfileInfoView: React\.FC<\{ profile: MyProfile \}> = \(\{ profile \}\) => \(/,
  "const ProfileInfoView: React.FC<{ profile: MyProfile }> = ({ profile }) => {\n  const { t } = useTranslation(['profile']);\n  return ("
);
content = content.replace(
  /([ \t]*<\/NeuSurface>\r?\n[ \t]*)\}\s*<\/>\s*\);/,
  "$1  }\n  </>\n  );\n};"
);

// If the above didn't match because of `    )}`, let's do a more robust string replacement:
content = content.replace(
  "      </NeuSurface>\r\n    )}\r\n  </>\r\n);",
  "      </NeuSurface>\r\n    )}\r\n  </>\r\n  );\n};"
);
content = content.replace(
  "      </NeuSurface>\n    )}\n  </>\n);",
  "      </NeuSurface>\n    )}\n  </>\n  );\n};"
);

content = content.replace(
  /const CvView: React\.FC<\{ cvUrl\?: string; cvFileName\?: string; onRefresh: \(\) => void \}> = \(\{ cvUrl, cvFileName, onRefresh \}\) => \{/,
  "const CvView: React.FC<{ cvUrl?: string; cvFileName?: string; onRefresh: () => void }> = ({ cvUrl, cvFileName, onRefresh }) => {\n  const { t } = useTranslation(['profile']);"
);

content = content.replace(
  /export const ProfileTab: React\.FC = \(\) => \{/,
  "export const ProfileTab: React.FC = () => {\n  const { t } = useTranslation(['profile', 'common']);"
);

// Replacements
content = content.replace("{v === 'profile' ? 'Profile Info' : 'My CVs'}", "{v === 'profile' ? t('profileInfo', 'Profile Info') : t('myCvs', 'My CVs')}");

content = content.replace("label: 'On OJT'", "label: t('onOjt', 'On OJT')");
content = content.replace("label: 'Accepted'", "label: t('accepted', 'Accepted')");
content = content.replace("label: 'Matched'", "label: t('matched', 'Matched')");
content = content.replace("label: 'Eligible'", "label: t('eligible', 'Eligible')");
content = content.replace("label: 'Cancelled'", "label: t('cancelled', 'Cancelled')");
content = content.replace("label: status || 'Unknown'", "label: status || t('unknown', 'Unknown')");

// Fix SmallPill style prop
content = content.replace("<SmallPill color={s.color} style={{ background: s.bg }}>", "<SmallPill color={s.color} bg={s.bg}>");

content = content.replace(/>Academic Information</, ">{t('academicInfo', 'Academic Information')}<");
content = content.replace("label: 'Semester'", "label: t('semester', 'Semester')");
content = content.replace("label: 'Current Semester'", "label: t('currentSemester', 'Current Semester')");
content = content.replace("label: 'GPA'", "label: t('gpa', 'GPA')");

content = content.replace(/>School Information</, ">{t('schoolInfo', 'School Information')}<");
content = content.replace(/>Managed by administrator</, ">{t('managedByAdmin', 'Managed by administrator')}<");
content = content.replace("label: 'Student ID (MSSV)'", "label: t('studentId', 'Student ID (MSSV)')");
content = content.replace("label: 'Email'", "label: t('email', 'Email')");
content = content.replace("label: 'Major / Department'", "label: t('major', 'Major / Department')");
content = content.replace("label: 'Full Name'", "label: t('fullName', 'Full Name')");

content = content.replace(/>Skills</, ">{t('skills', 'Skills')}<");

content = content.replace(/>My CVs</g, ">{t('myCvs', 'My CVs')}<");
content = content.replace(/>PDF format only, max 5MB</, ">{t('onlyPdf', 'PDF format only, max 5MB')}<");
content = content.replace(/>Drop your CV here</, ">{t('dropCvHere', 'Drop your CV here')}<");
content = content.replace("or click to browse &mdash; PDF only, max 5MB", "{t('clickToBrowse', 'or click to browse — PDF only, max 5MB')}");
content = content.replace("Only one CV is allowed &mdash; uploading a new file replaces the current one", "{t('onlyOneCv', 'Only one CV is allowed — uploading a new file replaces the current one')}");

content = content.replace(/>Upload</g, ">{t('upload', 'Upload')}<");
content = content.replace(/>Uploaded CV</, ">{t('uploadedCv', 'Uploaded CV')}<");
content = content.replace(/>View</, ">{t('view', 'View')}<");
content = content.replace(/>Delete</, ">{t('delete', 'Delete')}<");
content = content.replace(/>Upload New CV</, ">{t('uploadNewCv', 'Upload New CV')}<");
content = content.replace(/>Cancel</g, ">{t('cancel', 'Cancel')}<");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('ProfileTab updated successfully');
