def calculate_next_level(current_level: int, recent_answers: list[bool]) -> int:
    """
    Menentukan level berikutnya berdasarkan beberapa jawaban terakhir.
    - Jika 2 jawaban terakhir benar berturut-turut dan level < 3, naikkan level.
    - Jika jawaban terakhir salah, turunkan level (minimal level 1) atau pertahankan.
    """
    if len(recent_answers) >= 2 and all(recent_answers[-2:]) and current_level < 3:
        return current_level + 1
    elif len(recent_answers) > 0 and not recent_answers[-1] and current_level > 1:
        return current_level - 1
    return current_level