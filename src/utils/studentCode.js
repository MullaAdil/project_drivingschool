/**
 * GAFOOR DRIVING SCHOOL — CODE GENERATOR & NORMALIZER
 * 
 * Student Format:  [Initials]- GS[Sequence]  e.g. "Mulla adil" -> "MA- GS01", "Teja Prasad" -> "TP- GS02"
 * Trainer Format:  [Initials]-TG[Sequence]   e.g. "Abdul Hameed" -> "AH-TG01", "K. Srinivas" -> "SR-TG01"
 * 
 * GS = Gafoor Student
 * TG = Trainer Gafoor
 */

export function extractInitials(name) {
  if (!name || typeof name !== 'string') return 'GS';
  
  // Clean string: remove non-alphanumeric except spaces
  const cleaned = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const firstChar = parts[0][0] || 'G';
    const secondChar = parts[1][0] || 'S';
    return `${firstChar}${secondChar}`.toUpperCase();
  }

  if (parts.length === 1) {
    const single = parts[0];
    if (single.length >= 2) {
      return single.substring(0, 2).toUpperCase();
    } else if (single.length === 1) {
      return `${single}X`.toUpperCase();
    }
  }

  return 'GS';
}

/**
 * Normalizes any code (e.g. "MA- GS01", "MA-GS01", "ma- gs01" -> "MA-GS01")
 * Handles spaces after hyphen gracefully so user input always matches.
 */
export function normalizeCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.replace(/\s+/g, '').toUpperCase();
}

/**
 * Computes next sequence number based on existing students list
 * Inspects codes matching *-GS(\d+) or legacy *-G(\d+)
 */
export function getNextStudentSequence(existingStudents = []) {
  let highest = 0;
  
  for (const student of existingStudents) {
    const code = normalizeCode(student.studentCode || student.id || '');
    const match = code.match(/-GS(\d+)$/i) || code.match(/-G(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highest) {
        highest = num;
      }
    }
  }

  return highest + 1;
}

/**
 * Generates unique student code: e.g. "MA- GS01", "TP- GS02"
 */
export function generateStudentCode(name, sequenceNumber) {
  const initials = extractInitials(name);
  const padded = String(sequenceNumber).padStart(2, '0');
  return `${initials}- GS${padded}`;
}

/**
 * Computes next sequence number based on existing trainers list
 * Inspects codes matching *-TG(\d+) or legacy *-T(\d+)
 */
export function getNextTrainerSequence(existingTrainers = []) {
  let highest = 0;
  
  for (const trainer of existingTrainers) {
    const code = normalizeCode(trainer.trainerCode || trainer.id || '');
    const match = code.match(/-TG(\d+)$/i) || code.match(/-T(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highest) {
        highest = num;
      }
    }
  }

  return highest + 1;
}

/**
 * Generates unique trainer code: e.g. "AH-TG01", "SR-TG01"
 */
export function generateTrainerCode(name, sequenceNumber) {
  const initials = extractInitials(name);
  const padded = String(sequenceNumber).padStart(2, '0');
  return `${initials}-TG${padded}`;
}
