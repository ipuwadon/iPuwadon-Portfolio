import pytest

from app.content import ContentError, FileContentRepository, parse_document, validate_meta

JOURNEY = {
    'title': 'T', 'date': '2020-01-01', 'technologies': ['x'], 'challenges': ['c'], 'lessons': ['l'],
    'reflection': {'what_happened': 'a', 'what_i_learned': 'b', 'what_i_would_do_differently': 'c'},
}


def test_valid_journey():
    data = validate_meta('journey', 'x', JOURNEY, 'story')
    assert data['reflection']['what_i_learned'] == 'b'


def test_journey_missing_reflection_part_fails():
    bad = {**JOURNEY, 'reflection': {'what_happened': 'a'}}
    with pytest.raises(ContentError):
        validate_meta('journey', 'x', bad, 'story')


def test_journey_missing_field_fails():
    bad = {k: v for k, v in JOURNEY.items() if k != 'technologies'}
    with pytest.raises(ContentError):
        validate_meta('journey', 'x', bad, 'story')


def test_project_status_restricted():
    with pytest.raises(ContentError):
        validate_meta('project', 'x', {'title': 'p', 'status': 'Weird'}, '')


def test_lesson_requires_sections():
    with pytest.raises(ContentError):
        validate_meta('lesson', 'x', {'title': 'L'}, '## Context\ntext')


def test_parse_requires_front_matter():
    with pytest.raises(ContentError):
        parse_document('no front matter')


def test_repo_skips_invalid_and_blocks_traversal(tmp_path):
    (tmp_path / 'journey').mkdir()
    (tmp_path / 'journey' / 'bad.md').write_text('---\ntitle: x\n---\nbody', encoding='utf-8')
    repo = FileContentRepository(tmp_path)
    assert repo.list('journey') == []
    assert repo.get('journey', '../secret') is None
    with pytest.raises(ContentError):
        repo.save('journey', '../evil', JOURNEY, 'story')
